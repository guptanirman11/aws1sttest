// This plugin is built for the digit span recall task. It's set up so that you can allow an arbitrary number of characters, and the user can
// input them noramally using their keyboard, but instead of it "feeling" like a regular entry box, the character show up on screen in a dynamic, javascript-html-y way.
jsPsych.plugins["string-entry"] = (function () {

    var plugin = {};

    plugin.info = {
        name: "string-entry",
        parameters: {
            prompt: {
                type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
                default: undefined
            },
            answer: {
                type: jsPsych.plugins.parameterType.STRING,
                default: undefined
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                default: jsPsych.ALL_KEYS,
                array: true
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                default: 15000,
                description: 'How long to show trial before it ends.'
            },
            delay: {
                type: jsPsych.plugins.parameterType.INT,
                default: 0,
                description: 'Time to wait (ms) after subject enters the last number before moving on.'
            },
            entry_size: {
                type: jsPsych.plugins.parameterType.INT,
                default: 42,
                description: 'Size (in px) of the entry feedback text.'
            }
        }
    }

    plugin.trial = function(display_element, trial) {
        //display prompt
        var html = '<div id="jspsych-string-entry-prompt">' + trial.prompt + '</div>';


        var response = {
            rt: null,
            response: null
        }
        var entryString = ''
        display_element.innerHTML = html + '<p style="font-size: ' + trial.entry_size + 'px">&nbsp;' + entryString + '</p>';

        var startTime = performance.now();


        var after_response = function(info){
            if (info.key === 13) {
                // 13 is enter
                var endTime = performance.now();
                var rt = endTime - startTime;
                response.entry = entryString;
                response.rt = Math.round(rt);
                setTimeout(() => end_trial(), trial.delay);
            }
            else if (info.key === 8) {
                // 8 is backspace
                entryString = entryString.substr(0, entryString.length - 1);
            } else {
                entryString +=
                    jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(info.key).replace('numpad', '');
            }
            var endTime = performance.now();
            var rt = endTime - startTime;
            response.entry = entryString;
            response.rt = rt;
            display_element.innerHTML = html + '<p style="font-size: ' + trial.entry_size + 'px">&nbsp;' + entryString + '</p>';
        }


        var end_trial = function () {


            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            // data saving
            // noinspection ES6ConvertVarToLetConst
            var trial_data = {
                "rt": response.rt,
                "answer": trial.answer,
                "response": response.entry
            };

            // clear the display
            display_element.innerHTML = '';

            // end trial
            jsPsych.finishTrial(trial_data);
        }

        if (trial.choices !== jsPsych.NO_KEYS) {
            var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: after_response,
                valid_responses: trial.choices,
                rt_method: 'performance',
                persist: true,
                allow_held_key: false
            });
        }

        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }
    };

    return plugin;
})();
