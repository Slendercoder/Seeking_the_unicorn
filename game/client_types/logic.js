/**
 * # Logic type implementation of the game stages
 * Copyright(c) 2017 Edgar Andrade-Lotero <edgar.andrade@urosario.edu.co>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

 "use strict";

 var ngc = require('nodegame-client');
 var stepRules = ngc.stepRules;
 var constants = ngc.constants;
 var counter = 0;

 module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

     var node = gameRoom.node;
     var channel =  gameRoom.channel;

     // Must implement the stages here.

     // Increment counter.
     counter = counter ? ++counter : settings.SESSION_ID || 1;

     stager.setOnInit(function() {

         // Initialize the client.

     });

     stager.extendStep('instructions', {
         cb: function() {
             console.log('Instructions');
         }
     });

 /*
     stager.extendStep('trials', {
         cb: function() {
             console.log('\n%%%%%%%%%%%%%%%');
             console.log('Game round: ' + node.player.stage.round);
             doMatch();
         }
     });
 */

     stager.extendStep('game', {
         cb: function() {
             console.log('\n%%%%%%%%%%%%%%%');
             console.log('Game round: ' + node.player.stage.round);
             doMatch();
         }
     });

     stager.extendStep('score', {
         cb: function() {
             console.log('Presenting the score');
         }
     });

     stager.extendStep('debrief', {
         cb: function() {
             console.log('Debrief');
         }
     });

    //  stager.extendStep('finalfeedback', {
    //      cb: function() {
    //          console.log('Finalfeedback');
    //      }
    //  });

    stager.extendStep('demographics', {
        cb: function() {
            console.log('Demographics');
        }
    });
    //
    // stager.extendStep('belief', {
    //     cb: function() {
    //         console.log('Belief');
    //     }
    // });

     stager.extendStep('end', {
         cb: function() {
             console.log('Game has finished!');
             node.game.memory.save('data_' + node.nodename + '.json');
         }
     });

     stager.setOnGameOver(function() {
         // Something to do.
     });

     // Here we group together the definition of the game logic.
     return {
         nodename: 'lgc' + counter,
         // Extracts, and compacts the game plot that we defined above.
         plot: stager.getState()
     };

     // Helper functions.

     function doMatch() {
         var players;

         players = node.game.pl.id.getAllKeys();

         console.log('width: ', settings.width);
         console.log('num_locations: ', settings.num_locations);
         console.log('p_unicorn: ', settings.p_unicorn);

         // Determine if there is a unicorn, and if so, placing it in a location
         var p = Math.random();
         var unicorn = false;
         var x_unicorn = -1;
         var y_unicorn = -1;
         if (p < settings.p_unicorn) {
             unicorn = true;
             x_unicorn = Math.floor(Math.random() * settings.num_locations);
             y_unicorn = Math.floor(Math.random() * settings.num_locations);
         }

         console.log('unicorn: ', unicorn);
         console.log('x_unicorn: ', x_unicorn);
         console.log('y_unicorn: ', y_unicorn);

         node.say('Settings', players[0],
                  [players[1], unicorn, x_unicorn, y_unicorn]);
         node.say('Settings', players[1],
                  [players[0], unicorn, x_unicorn, y_unicorn]);
     }
 };
