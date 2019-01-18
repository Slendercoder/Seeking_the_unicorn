/**
 * # Game setup
 * Copyright(c) 2017 Edgar Andrade-Lotero <edgar.andrade@urosario.edu.co>
 * MIT Licensed
 *
 * This file includes settings that are shared amongst all client types
 *
 * Setup settings are passed by reference and can be modified globally
 * by any instance executing on the server (but not by remote instances).
 *
 * http://www.nodegame.org
 * ---
 */
 module.exports = function(settings, stages) {

     var setup = {};

     //auto: true = automatic run, auto: false = user input
     setup.env = {
         auto: false
     };

     setup.debug = false;

     setup.verbosity = 0;

     setup.window = {
 //        promptOnleave: !setup.debug
         disableRightClick: true,
         promptOnleave: false,
         disabledBackButton: true
     }

     // Metadata. Taken from package.json. Can be overwritten.
     // setup.metadata = {
     //    name: 'another name',
     //    version: 'another version',
     //    description: 'another descr'
     // };

     return setup;
 };
