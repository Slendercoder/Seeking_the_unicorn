/**
 * # Player type implementation of the game stages
 * Copyright(c) 2017 Edgar Andrade-Lotero <edgar.andrade@urosario.edu.co>
 * MIT Licensed
 *
 * Each client type must extend / implement the stages defined in `game.stages`.
 * Upon connection each client is assigned a client type and it is automatically
 * setup with it.
 *
 * http://www.nodegame.org
 * ---
 */

 "use strict";

 var ngc = require('nodegame-client');
 var stepRules = ngc.stepRules;
 var constants = ngc.constants;
 var publishLevels = constants.publishLevels;

 module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

     var game;

     stager.setOnInit(function() {

         // Initialize the client.

         var header, frame;

         // Setup page: header + frame.
         header = W.generateHeader();
         frame = W.generateFrame();

         // Add widgets.
         this.visualRound = node.widgets.append('VisualRound', header);
         //        this.visualTimer = node.widgets.append('VisualTimer', header);

         //this.doneButton = node.widgets.append('DoneButton', header);

         // Additional debug information while developing the game.
         // this.debugInfo = node.widgets.append('DebugInfo', header)

         // COMMENTED FOR TESTING. USE FOR REAL GAME.
         // This is called when a new tab is open (but not on a new window).
         //      W.onFocusOut(function() {
         //        // For example.
         //        alert('Go back to the experiments tab. If unsure how to do it contact the experimenter.');
         //        // Or just log it (might even decide to pause the game, but I wouldn't do it.).
         //        node.say('tabswitch');
         //      });

 	// The score of each participant
 	this.SCORE = {};

 	// Keeps track of players' guesses
 	this.GUESSES =  {};

 	// Keeps track of players' performance
 	this.PERFORMANCE =  {};

         this.showScore = function() {
             var i, j;

             var pointsC = 0;
             var me = node.player.id;

             var where_me = node.game.where_me;
             var where_order = node.game.where_order;
             var where_partner = node.game.where_partner;
             var unicorn = node.game.unicorn;
             var x_unicorn = node.game.x_unicorn;
             var y_unicorn = node.game.y_unicorn;

             var num_locations = node.game.settings.num_locations;

             W.getElementById('container').style.display = 'none';
             W.getElementById('container2').style.display = '';

             if (node.game.playersGuess == unicorn) {
                 W.getElementById('answer').style.color = 'black';
                 W.setInnerHTML('answer', 'correct');
                 W.setInnerHTML('correct_incorrect', 'correct');
                 if (unicorn === true) {
                     // pointsC = 18;
                     // pointsC = 13;
                     pointsC = (num_locations*num_locations)/2;
                 } else {
                     // pointsC = 27;
                     // pointsC = 24;
                     pointsC = (num_locations*num_locations)/2;
                 }
             } else {
                 pointsC = -(num_locations*num_locations);
                 W.getElementById('answer').style.color = 'red';
                 W.setInnerHTML('answer', 'INCORRECT!');
                 W.setInnerHTML('correct_incorrect', 'incorrect');
             }
             if (unicorn === true) {
                 W.setInnerHTML('with_without', 'present');
             } else {
                 W.setInnerHTML('with_without', 'absent');
             }
             W.setInnerHTML('pointsC', pointsC);

             // Variable used to determine the number of locations
             // visited by the two players.
             var joint = 0;
             // Variable used to display locations visited by this player
             var visited = [];
             // Variable used to display locations visited by order
             var visited_order = [];

             for (i = 0; i < num_locations; i++) {
                 for (j = 0; j < num_locations; j++) {
                     if (where_me[i][j] * where_partner[i][j] !== 0) {
                         joint += 1;
                     }
                     visited.push(where_me[i][j]);
                     visited_order.push(where_order[i][j]);
                 }
             }
             W.setInnerHTML('pointsA', joint);
             W.setInnerHTML('Joint', joint);

             // Añade el puntaje a la variable global SCORE
             if (node.game.SCORE.hasOwnProperty(me)) {
                 node.game.SCORE[me].push(pointsC - joint);
                 W.setInnerHTML('Score', node.game.SCORE[me][node.game.SCORE[me].length - 1]);
             } else {
                 node.game.SCORE[me] = [pointsC - joint];
                 W.setInnerHTML('Score', node.game.SCORE[me][0]);
             }

             // Guarda la información del puntaje
             var tiempo = node.timer.getTimeDiff('RoundStart', 'Answer');
             var perform = []; // vector with information on performance.
             perform.push(node.player.stage.round);
             perform.push(me);
             if (node.game.playersGuess === true) {
                 perform.push('Present');
             } else {
                 perform.push('Absent');
             }
             perform.push(tiempo);
             for (i = 0; i < visited.length; i++) {
                 perform.push(visited[i]);
             }
             for (i = 0; i < visited_order.length; i++) {
                 perform.push(visited_order[i]);
             }
             perform.push(node.game.SCORE[me][node.game.SCORE[me].length - 1]);
             perform.push(joint);

             if (unicorn === true) {
                 perform.push('Unicorn_Present');
             } else {
                 perform.push('Unicorn_Absent');
             }

             perform.push(x_unicorn);
             perform.push(y_unicorn);

             node.game.PERFORMANCE[me].push(perform);

             // Ask the html to draw the score
             node.emit('DrawScore', node.game.SCORE[me]);

         }; // end function showScore

     });

     stager.extendStep('instructions', {
         frame: 'instructions.htm',
         cb: function() {
             var buttonSubmit1 = W.getElementById('GoToGame');
             W.setInnerHTML('Num_Loc', node.game.settings.num_locations*node.game.settings.num_locations);
             buttonSubmit1.onclick = function() { node.done(); };
         }
     });

     stager.extendStep('game', {
         // donebutton: false,
         frame: 'trials2.htm',
         init: function() {
             var i, j;
             var num_locations;

             num_locations = node.game.settings.num_locations;

             this.unicorn = null;

             // True if guess "Present"; False if guess "Absent"
             this.playersGuess = null;

             // This variable stores the number of my clicks.
             this.my_clicks = 0;
             // This variable stores the locations visited in their order.
             this.where_order = [];
             // This variable stores a +1 on the location that was visited by me.
             this.where_me = [];

             for (i = 0; i < num_locations; i++) {
                 this.where_me[i] = [];
                 this.where_order[i] = [];
                 for (j = 0; j < num_locations; j++) {
                     this.where_me[i][j] = 0;
                     this.where_order[i][j] = 0;
                 }
             }

             // This variable stores the number of my partner's clicks.
             node.game.partners_clicks = 0;
             // This variable stores a +1 on the location that was visited
             // by my partner.
             node.game.where_partner = [];
             for (i = 0; i < num_locations; i++) {
                 node.game.where_partner[i] = [];
                 for (j = 0; j < num_locations; j++) {
                     node.game.where_partner[i][j] = 0;
                 }
             }

             // Initialize global variables that keeps track of
             // this player's guesses and performance
             node.game.GUESSES[node.player.id] = [];
             node.game.PERFORMANCE[node.player.id] = [];

         },
         cb: function() {
             var that, me;

             // this changes reference inside the callback, so we copy into that.
             // this (or that) are equal to node.game.
             that = this;

             me = node.player.id;

             // Hide the score immediately.
             W.getElementById('container2').style.display = 'none';

             // Instructions for player A
             node.on.data('Settings', function(msg) {

                 // Get the time when the round starts
                 node.timer.setTimestamp('RoundStart');

                 var MESSAGE = msg.data;

                 // MESSAGE should contain:

                 var other_player = MESSAGE[0].toString();  // The other player's id
                 var unicorn = MESSAGE[1];                  // True if there is a unicorn; false otherwise
                 var x_unicorn = MESSAGE[2];                // The position of the unicorn in the x axis
                 var y_unicorn = MESSAGE[3];                // The position of the unicorn in the y axis

                 // Store reference of settings in node.game.
                 node.game.other_player = other_player;
                 node.game.unicorn = unicorn;
                 node.game.x_unicorn = x_unicorn;
                 node.game.y_unicorn = y_unicorn;

                 // The partner's initial status
                 var partners_status = false;

                 // Set the buttons
                 var buttonA, buttonB, buttonSubmit;
                 buttonA = W.getElementById('submitPresent');
                 buttonA.disabled = false;
                 buttonB = W.getElementById('submitAbsent');
                 buttonB.disabled = false;
                 buttonSubmit = W.getElementById('DONE');
                 buttonSubmit.disabled = true;

                 // Initialize the window for the game
                 W.getElementById('container').style.display = '';
                 W.setInnerHTML('PlayersGuess', '');
                 W.setInnerHTML('PartnersGuess', '');
                 W.setInnerHTML('partners_status', '');

                 // Send information to browser
                 node.emit('mySettings', MESSAGE);

                 // Listen on location visit.

                 node.on('checkLocation_me', function(locations) {
                     // console.log('locations ' + locations);
                     var x = locations[0];
                     var y = locations[1];
                     node.game.my_clicks += 1;
                     node.game.where_me[y][x] = 1;
                     node.game.where_order[y][x] = node.game.my_clicks;
                 });

                 node.on.data('checkLocation_partner', function(msg) {
                     var x = msg.data[0];
                     var y = msg.data[1];
                     // console.log('x: ' + x + ' y: ' + y);
                     node.game.partners_clicks += 1;
                     node.game.where_partner[y][x] = 1;
                     // console.log('where_partner[y][x] ' + node.game.where_partner[y][x]);
                 });

                 // Listen on click event.
                 buttonA.onclick = function() {
                     node.timer.setTimestamp('Guess');
                     var tiempo = node.timer.getTimeDiff('RoundStart', 'Guess');
                     node.game.GUESSES[me].push([
                         node.player.stage.round, me, 'Present', tiempo
                     ]);
                     W.setInnerHTML('PlayersGuess', 'Present');
                     buttonA.disabled = true;
                     buttonB.disabled = false;
                     buttonSubmit.disabled = false;
                     node.game.playersGuess = true;
                     node.say('decision', other_player, 'Present');
                 };
                 buttonB.onclick = function() {
                     node.timer.setTimestamp('Guess');
                     var tiempo = node.timer.getTimeDiff('RoundStart', 'Guess');
                     node.game.GUESSES[me].push([
                         node.player.stage.round, me, 'Absent', tiempo
                     ]);
                     W.setInnerHTML('PlayersGuess', 'Absent');
                     buttonB.disabled = true;
                     buttonA.disabled = false;
                     buttonSubmit.disabled = false;
                     node.game.playersGuess = false;
                     node.say('decision', other_player, 'Absent');
                 };
                 buttonSubmit.onclick = function() {
                     node.timer.setTimestamp('Answer');
                     node.say('other_player_ready', other_player);
                     console.log('Player ' + me + ' is ready');
                     node.done();
                 };

                 // Diminish the score because other_player clicked location visited by me
                 node.on.data('diminish_scorebar', function(msg){
                   console.log('Palyer.js recibio info');
                   console.log(msg.data);
                   node.emit('minus_score', msg.data);
                 });

                 // Display the other player's guess
                 node.on.data('decision', function(msg) {
                     W.setInnerHTML('PartnersGuess', msg.data);
                 });

                 // Display the other player is ready
                 node.on.data('other_player_ready', function(msg) {
                     partners_status = true;
                     W.setInnerHTML('partners_status',
                                    'Your partner is ready for ' +
                                    'the next round');
                 });
               }); // end role
           } // end cb function
       });

     stager.extendStep('score', {
         // donebutton: false,
         // frame: 'score.htm',
         cb: function() {
           var buttonNext;

           node.emit('clear_paper');

           // Show the score
           this.showScore();

           // Move on to next round
           buttonNext = W.getElementById('DONE1');
           buttonNext.disabled = false;
           buttonNext.onclick = function() {
               node.done({
                   Guesses: node.game.GUESSES[node.player.id],
                   Performance: node.game.PERFORMANCE[node.player.id],
                   Strategy: []
               });
           };
         }
     });


     stager.extendStep('debrief', {
         // donebutton: false,
         frame: 'debrief.htm',
         cb: function() {
             var buttonSubmit1 = W.getElementById('GoToFeedback');
             buttonSubmit1.onclick = function() {
                 node.done({
                     Guesses: [],
                     Performance: [],
                     Strategy: []
                 });
             };
         }
     });

    //  stager.extendStep('finalfeedback', {
    //      // donebutton: false,
    //      frame: 'finalfeedback.htm',
    //      cb: function() {
    //          var texto = W.getElementById('myTextBox');
    //          texto.value = "";
    //          var buttonSubmit1 = W.getElementById('END');
    //          buttonSubmit1.onclick = function() {
    //              node.done({
    //                  Guesses: [],
    //                  Performance: [],
    //                  Strategy: texto.value
    //              });
    //          };
    //      }
    //  });

    // Demographics.

       stager.extendStep('demographics', {
           init: function() {
               var w;
               w = node.widgets;
               this.demo = w.get('ChoiceManager', {
                   id: 'demo',
                   title: false,
                   shuffleForms: true,
                   forms: [
                       w.get('ChoiceTable', {
                           id: 'gender',
                           mainText: 'What is your sex?',
                           choices: [
                               'Male', 'Female', 'Other', 'Do not want to say'
                           ],
                           shuffleChoices: true,
                           title: false,
                           requiredChoice: true
                       }),
                       w.get('ChoiceTable', {
                           id: 'age',
                           mainText: 'What is your age group?',
                           choices: [
                               '18-20', '21-30', '31-40', '41-50',
                               '51-60', '61-70', '71+', 'Do not want to say'
                           ],
                           title: false,
                           requiredChoice: true
                       }),
                       w.get('ChoiceTable', {
                           id: 'political_party',
                           mainText: 'What is your political party?',
                           choices: [
                               'Democrat', 'Republican', 'Socialist',
                               'Green','Libertarian', 'Independent', 'Do not want to say'
                           ],
                           title: false,
                           requiredChoice: true
                       }),
                       w.get('ChoiceTable', {
                           id: 'carreer',
                           mainText: 'What is the area of your study?',
                           choices: [
                               'Natural Sciences', 'Social Sciences', 'Arts and Humanities',
                               'Mathematics and/or Statistics', 'Do not want to say'
                           ],
                           title: false,
                           requiredChoice: true
                       }),
                       w.get('ChoiceTable', {
                           id: 'location',
                           mainText: 'What is your location?',
                           choices: [
                               'US', 'Colombia', 'Other', 'Do not want to say'
                           ],
                           shuffleChoices: true,
                           title: false,
                           requiredChoice: true
                       }),
                       w.get('ChoiceTable', {
                           id: 'strategy',
                           mainText: 'During the game, and specially in regards ' +
                           'to the work of uncovering the tiles, I',
                           choices: [
                               'Tried to get my partner to do all or most of the work',
                               'Tried to do all or most of the work myself',
                               'Tried to divide the workload', 'Do not want to say'
                           ],
                           title: false,
                           requiredChoice: true
                         }),
                         w.get('ChoiceTable', {
                             id: 'orientation',
                             mainText: 'During the game, I tried to',
                             choices: [
                                 'Maximize my points',
                                 'Cooperate with partner',
                                 'Both', 'Do not want to say'
                             ],
                             title: false,
                             requiredChoice: true
                       })
                   ]
               });
           },
           frame: 'demo.html', // must exist, or remove.
           cb: function() {
               var buttonSubmit = W.getElementById('GoToEnd');
               buttonSubmit.onclick = function() {
                   node.done();
               }
           },
           done: function() {
               var values, isTimeup;
               values = this.demo.getValues({ highlight: true });
               console.log(values);
               // In case you have a timer running, block done procedure
               // if something is missing in the form and it is not a timeup yet.
               isTimeup = node.game.timer.isTimeup();
               if (values.missValues.length && !isTimeup) return false;
               // Adds it to the done message sent to server.
               return {
                   Guesses: [],
                   Performance: [],
                   Strategy: [],
                   valores: values
               };
           }
       });
    //
    //
    //  // Self-efficacy measure (How will you rank in the game 1-9?).
    //
    //   stager.extendStep('belief', {
    //        init: function() {
    //            this.belief = node.widgets.get('ChoiceTable', {
    //                id: 'belief',
    //                title: false,
    //                left: 'worst',
    //                right: 'best',
    //                choices: [
    //                    '9<sup>th</sup>', '8<sup>th</sup>', '7<sup>th</sup>',
    //                    '6<sup>th</sup>', '5<sup>th</sup>', '4<sup>th</sup>',
    //                    '3<sup>rd</sup>', '2<sup>nd</sup>', '1<sup>st</sup>'
    //                ],
    //                requiredChoice: true
    //            });
    //        },
    //        frame: 'belief.html',
    //        done: function() {
    //            var values;
    //            values = this.belief.getValues({ highlight: true });
    //            if (values.choice === null) return false;
    //            return values;
    //        }
    //    });


     stager.extendStep('end', {
         // donebutton: false,
         frame: 'end.htm',
         cb: function() {
         }
     });

     game = setup;
     game.plot = stager.getState();
     return game;
 };
