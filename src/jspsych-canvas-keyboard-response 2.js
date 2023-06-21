jsPsych.plugins["canvas-keyboard-response"] = (function() {

    let plugin = {};

    plugin.info = {
        name: "canvas-keyboard-response",
        description: 'Creates a canvas, then runs the function you supply.',
        parameters: {
            func: {
                type: jsPsych.plugins.parameterType.FUNCTION, 
                default: undefined,
                pretty_name: 'Function',
                descripton: 'Function to call.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: undefined,
                description: 'The HTML string to be displayed below the canvas.'
            },
            stimulus: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The HTML string to be displayed above the canvas.'
            },
            canvas_id:{
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Canvas ID',
              default: 'canvas',
              description: 'The ID of the canvas html block.'
            },
            show_stim_with_feedback: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: true,
                no_function: false,
                description: ''
            },
            choices: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                array: true,
                pretty_name: 'Choices',
                default: jsPsych.ALL_KEYS,
                description: 'The keys the subject is allowed to press to respond to the stimulus.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show trial before it ends.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, trial will end when subject makes a response.'
            },
            key_answer: {
                type: jsPsych.plugins.parameterType.KEYCODE,
                pretty_name: 'Key answer',
                default: undefined,
                description: 'The key to indicate the correct response.'
            },
            text_answer: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Text answer',
                default: null,
                description: 'Label that is associated with the correct answer.'
            }
        }
    };

    plugin.trial = function(display_element, trial) {

        // function to handle responses by the subject
        let after_response = function (info) {

            // after a valid response, the stimulus will have the CSS class 'responded'
            // which can be used to provide visual feedback that a response was recorded
            display_element.querySelector('#jspsych-canvas-keyboard-response-stimulus').className += ' responded';

            // only record the first response
            if (response.key == null) {
                response = info;
            }

            if (trial.response_ends_trial) {
                end_trial();
            }
        };

        let keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: trial.choices,
            rt_method: 'date',
            persist: false,
            allow_held_key: false
        });
        let new_html = '<p><div id="jspsych-canvas-keyboard-response-stimulus">' + trial.stimulus + '</div></p>' +
            '<canvas id="' + trial.canvas_id + '" width="1000" style="border: transparent"></canvas><p>';

        if(trial.prompt !== null){
            new_html += trial.prompt + "</p>";
        }

        display_element.innerHTML = new_html;
        trial.func()
        let response = {
            rt: null,
            key: null
        };

        // function to end trial when it is time
        let end_trial = function () {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            // gather the data to store for the trial
            let trial_data = {
                "rt": Math.round(response.rt),
                "key_press": response.key,
                "answer_key": trial.answer_key
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };



        if (trial.choices !== jsPsych.NO_KEYS) {
        }

        // hide stimulus if stimulus_duration is set
        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                display_element.querySelector('#jspsych-canvas-keyboard-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // end trial if trial_duration is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }

    };

    return plugin;
})();