/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'go_nogo_with_two_by_two'})
}

function evalAttentionChecks() {
  var check_percent = 1
  if (run_attention_checks) {
    var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed / attention_check_trials.length
  }
  jsPsych.data.addDataToLastTrial({"att_check_percent": check_percent})
  return check_percent
}

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[77] = 0
	choice_counts[90] = 0
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'test_trial') {
			
			if (experiment_data[i].go_no_go_condition == 'go'){
				trial_count += 1
			}
			
			if ((experiment_data[i].go_no_go_condition == 'go') && (experiment_data[i].rt != -1)){
				rt = experiment_data[i].rt
				rt_array.push(rt)
				key = experiment_data[i].key_press
				choice_counts[key] += 1
				if (experiment_data[i].key_press == experiment_data[i].correct_response){
					correct += 1
				}
			} else if ((experiment_data[i].go_no_go_condition == 'go') && (experiment_data[i].rt == -1)){
				missed_count += 1
			} else if ((experiment_data[i].go_no_go_condition == 'nogo') && (experiment_data[i].rt != -1)){
				rt = experiment_data[i].rt
				rt_array.push(rt)
			}
		}
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var accuracy = correct / trial_count
	var missed_percent = missed_count/trial_count
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.60)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
}


var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

var getCategorizeIncorrectText = function(){
	if (go_no_go_condition == 'go'){
	
		return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + '<div class = promptbox>' + prompt_task_list + '</div>'
	} else {
	
		return '<div class = fb_box><div class = center-text><font size = 20>Letter is '+go_no_go_styles[1]+'.</font></div></div>' + '<div class = promptbox>' + prompt_task_list + '</div>'
	}

}

var getTimeoutText = function(){
	if (go_no_go_condition == "go"){
		return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + '<div class = promptbox>' + prompt_task_list + '</div>'
	} else {
		return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + '<div class = promptbox>' + prompt_task_list + '</div>'
	}
}

var getCategorizeCorrectText = function(){
	if (go_no_go_condition == "go"){
		return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + '<div class = promptbox>' + prompt_task_list + '</div>'
	} else {
		return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + '<div class = promptbox>' + prompt_task_list + '</div>'
	}
}

// Task Specific Functions
var getKeys = function(obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }
  return keys
}

var genStims = function(n) {
  stims = []
  for (var i = 0; i < n; i++) {
    var number = randomDraw('12346789')
    var color = 'white'
    var stim = {
      number: parseInt(number),
      color: color
    }
    stims.push(stim)
  }
  return stims
}

//Sets the cue-target-interval for the cue block
var setCTI = function() {
  return CTI //randomDraw([100, 900])
}

var getCTI = function() {
  return CTI
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}

/* Index into task_switches using the global var current_trial. Using the task_switch and cue_switch
change the task. If "stay", keep the same task but change the cue based on "cue switch". 
If "switch new", switch to the task that wasn't the current or last task, choosing a random cue. 
If "switch old", switch to the last task and randomly choose a cue.
*/
var setStims = function() {
  var tmp;
  switch (task_switches[current_trial].task_switch) {
  	case "na":
      tmp = curr_task
      curr_task = randomDraw(getKeys(tasks))
      cue_i = randomDraw([0, 1])
      break
    case "stay":
      if (curr_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks))
      }
      if (task_switches[current_trial].cue_switch == "switch") {
        cue_i = 1 - cue_i
      }
      break
    case "switch":
      cue_i = randomDraw([0, 1])
      if (last_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        }))
        last_task = tmp
      } else {
        tmp = curr_task
        curr_task = getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        })[0]
        last_task = tmp
      }
      break
    case "switch_old":
      cue_i = randomDraw([0, 1])
      if (last_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        }))
        last_task = tmp
      } else {
        tmp = curr_task
        curr_task = last_task
        last_task = tmp
      }
      break

  }
  curr_cue = tasks[curr_task].cues[cue_i]
  curr_stim = stims[current_trial]
  go_no_go_condition = task_switches[current_trial].go_no_go_type
  current_trial = current_trial + 1
  CTI = setCTI()
}

var getCue = function() {
  var cue_html = '<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>'+
  				 '<div class = lowerbox><div class = fixation>+</div></div>'
  return cue_html
}

var getStim = function() {
    
  if (go_no_go_condition == "nogo"){
  	stim_style = go_no_go_styles[1]
  } else if (go_no_go_condition == "go"){
    stim_style = go_no_go_styles[0]
  }
    
  var stim_html = '<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>' +
  				  '<div class = lowerbox><div class = gng_number><div class = cue-text>'+ preFileType + stim_style + '_' + curr_stim.number + fileTypePNG + '</div></div></div>'
		
  return stim_html
}


//Returns the key corresponding to the correct response for the current
// task and stim
var getResponse = function() {
  switch (curr_task) {
    case 'color':
      if (curr_stim.color == 'orange') {
      	correct_response = response_keys.key[0]
      	if(go_no_go_condition == "nogo"){
			correct_response = -1
		}
        return correct_response
      } else {
      	correct_response = response_keys.key[1]
      	if(go_no_go_condition == "nogo"){
			correct_response = -1
		}
        return correct_response
      }
      break;
    case 'magnitude':
      if (curr_stim.number > 5) {
      	correct_response = response_keys.key[0]
      	if(go_no_go_condition == "nogo"){
			correct_response = -1
		}
        return correct_response
      } else {
      	correct_response = response_keys.key[1]
      	if(go_no_go_condition == "nogo"){
			correct_response = -1
		}
        return correct_response
      }
      break;
    case 'parity':
      if (curr_stim.number % 2 === 0) {
      	correct_response = response_keys.key[0]
      	if(go_no_go_condition == "nogo"){
			correct_response = -1
		}
        return correct_response
      } else {
      	correct_response = response_keys.key[1]
      	if(go_no_go_condition == "nogo"){
			correct_response = -1
		}
        return correct_response
      }
  }
}


/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function() {
  var curr_trial = jsPsych.progress().current_trial_global
  var trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
  var trial_num = current_trial - 1 //current_trial has already been updated with setStims, so subtract one to record data
  var task_switch = task_switches[trial_num]
  jsPsych.data.addDataToLastTrial({
    cue: curr_cue,
    stim_color: curr_stim.color,
    stim_number: curr_stim.number,
    task: curr_task,
    task_condition: task_switch.task_switch,
    cue_condition: task_switch.cue_switch,
    go_no_go_condition: go_no_go_condition,
    trial_num: trial_num,
    CTI: CTI
  })
  
  if ((trial_id == 'test_trial') || (trial_id == 'practice_trial')){
  	jsPsych.data.addDataToLastTrial({correct_response: correct_response})
	if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).go_no_go_condition == 'nogo')){
		jsPsych.data.addDataToLastTrial({gng_stop_acc: 1})
	} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).go_no_go_condition == 'nogo')){
		jsPsych.data.addDataToLastTrial({gng_stop_acc: 0})
	}
	
	if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 1,
		})

	} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response){
		jsPsych.data.addDataToLastTrial({
			correct_trial: 0,
		})
	}
  }
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = true
var attention_check_thresh = 0.45
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0

var fileTypePNG = '.png"></img>'
var preFileType = '<img class = center src="/static/experiments/go_nogo_with_two_by_two/images/'
var accuracy_thresh = 0.70
var missed_thresh = 0.10
var practice_thresh = 3
var lowestNumCond = 20

// task specific variables
var response_keys = {key: [77,90], key_name: ["M","Z"]}
var choices = response_keys.key
var practice_length = 20
var test_length = 400
var numTrialsPerBlock = 80
var numTestBlocks = test_length / numTrialsPerBlock
var CTI = 300

var go_no_go_styles = ['solid','outlined']

//set up block stim. correct_responses indexed by [block][stim][type]
var tasks = {
  parity: {
    task: 'parity',
    cues: ['Parity', 'Odd-Even']
  },
  magnitude: {
    task: 'magnitude',
    cues: ['Magnitude', 'High-Low']
  }
}
/*
color: {
    task: 'color',
    cues: ['Color', 'Orange-Blue']
  },
*/

var task_switch_types = ["stay", "switch"]
var cue_switch_types = ["stay", "switch"]
var go_no_go_types = ["go","go","go","go","nogo"]
var task_switches_arr = []
for (var t = 0; t < task_switch_types.length; t++) {
  for (var c = 0; c < cue_switch_types.length; c++) {
  	for (var s = 0; s < go_no_go_types.length; s++){
  	
		task_switches_arr.push({
		  task_switch: task_switch_types[t],
		  cue_switch: cue_switch_types[c],
		  go_no_go_type: go_no_go_types[s]
		})
	}
  }
}
var task_switches = jsPsych.randomization.repeat(task_switches_arr, practice_length / lowestNumCond)
task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(["go","go","go","go","nogo"],1).pop()})
var practiceStims = genStims(practice_length + 1)
var testStims = genStims(numTrialsPerBlock + 1)
var stims = practiceStims
var curr_task = randomDraw(getKeys(tasks))
var last_task = 'na' //object that holds the last task, set by setStims()
var curr_cue = 'na' //object that holds the current cue, set by setStims()
var cue_i = randomDraw([0, 1]) //index for one of two cues of the current task
var curr_stim = 'na' //object that holds the current stim, set by setStims()
var current_trial = 0
var exp_stage = 'practice' // defines the exp_stage, switched by start_test_block

var task_list = 	   '<ul>'+
					   	'<li><i>Odd-Even</i> or <i>Parity</i>: ' + response_keys.key_name[1] + ' if odd and ' + response_keys.key_name[0] + ' if even.</li>'+
					   	'<li><i>High-Low</i> or <i>Magnitude</i>: ' + response_keys.key_name[1] + ' if <5 and ' + response_keys.key_name[0] + ' if >5.</li>'+
					   '</ul>'

var prompt_task_list = '<ul>'+
					   	'<li><i>Odd-Even</i> or <i>Parity</i>: ' + response_keys.key_name[1] + ' if odd and ' + response_keys.key_name[0] + ' if even.</li>'+
					   	'<li><i>High-Low</i> or <i>Magnitude</i>: ' + response_keys.key_name[1] + ' if <5 and ' + response_keys.key_name[0] + ' if >5.</li>'+
					   	'<li>Do not respond if the letter is '+go_no_go_styles[1]+'!</li>'+
					   '</ul>'



/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: "attention_check"
  },
  timing_response: 180000,
  response_ends_trial: true,
  timing_post_trial: 200
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       exp_id: "go_nogo_with_two_by_two",
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   timing_response: 360000,
   columns: [60,60]
};

/* define static blocks */
var feedback_instruct_text =
	'Welcome to the experiment. This experiment will take around 20 minutes. Press <i>enter</i> to begin.'
var feedback_instruct_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "instruction"
  },
  cont_key: [13],
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = centerbox>'+
    	'<p class = block-text>In this experiment you will have to respond to a sequence of numbers by pressing the "M" and "Z" keys. How you respond to the numbers will depend on the current task, which can change every trial.</p><p class = block-text>On some trials you will have to indicate whether the number is odd or even, and on other trials you will indicate whether the number is higher or lower than 5. Each trial will start with a cue telling you which task to do on that trial.</p>'+
    '</div>',
    
    '<div class = centerbox>'+
    	'<p class = block-text>The cue before the number will be a word indicating the task. There will be four different cues indicating 2 different tasks. The cues and tasks are described below:</p>' +
    	task_list +
    '</div>',
    
    '<div class = centerbox>' + 
		'<p class = block-text>On some trials, the letter will be '+go_no_go_styles[1]+' instead of '+go_no_go_styles[0]+'.  If the letter is '+go_no_go_styles[1]+', do not make a response on that trial.</p>'+
									
		'<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. You will be given a reminder of the rules for practice. <i>This will be removed for test!</i></p>'+
	'</div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.length; i++) {
      if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
        rt = data[i].rt
        sumInstructTime = sumInstructTime + rt
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Done with instructions. Press <i>enter</i> to continue.'
      return false
    }
  }
}
var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "end",
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
  cont_key: [13],
  timing_response: 180000,
  on_finish: function(){
  	assessPerformance()
  	evalAttentionChecks()
  }
};

var start_practice_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "practice_intro"
  },
  text: '<div class = centerbox><p class = center-block-text>Starting with some practice. </p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
  cont_key: [13]
};

var start_test_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "test_intro"
  },
  text: '<div class = centerbox>'+
  			'<p class = center-block-text>Practice completed. Starting test.</p>'+
  			'<p class = block-text>The cue before the number will be a word indicating the task. There will be four different cues indicating 2 different tasks. The cues and tasks are described below:</p>' +
    		task_list +
    		'<p class = center-block-text>Do not make a response if the letter is '+go_no_go_styles[1]+'.</p>'+
  			'<p class = center-block-text>Press <i>enter</i> to begin.</p>'+
  		'</div>',
  on_finish: function() {
    current_trial = 0
    stims = testStims
    task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / lowestNumCond)
    task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(["go","go","go","go","nogo"],1).pop()})
    feedback_text = 'Starting a test block.  Press enter to continue.'
  },
  timing_post_trial: 1000
}

/* define practice and test blocks */
var setStims_block = {
  type: 'call-function',
  data: {
    trial_id: "set_stims"
  },
  func: setStims,
  timing_post_trial: 0
}


var feedback_text = 
	'Welcome to the experiment. This experiment will take around 20 minutes. Press <i>enter</i> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-stop-feedback"
	},
	choices: [13],
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response: 180000,
	response_ends_trial: true, 

};


var practice_block = {
  type: 'poldrack-categorize',
  stimulus: getStim,
  is_html: true,
  key_answer: getResponse,
  correct_text: getCategorizeCorrectText,
  incorrect_text: getCategorizeIncorrectText,
  timeout_message: getTimeoutText,
  choices: choices,
  data: {
    trial_id: 'practice_trial',
    exp_stage: "practice"
  },
  timing_feedback_duration: 500,
  show_stim_with_feedback: false,
  timing_response: 2000,
  timing_stim: 1000,
  timing_post_trial: 0,
  prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
  on_finish: appendData
}



var test_block = {
  type: 'poldrack-single-stim',
  stimulus: getStim,
  is_html: true,
  key_answer: getResponse,
  choices: choices,
  data: {
    trial_id: 'test_trial',
    exp_stage: 'test'
  },
  timing_post_trial: 0,
  timing_response: 2000,
  timing_stim: 1000,
  on_finish: function(data) {
    appendData()
    correct_response = getResponse()
    correct = false
    if (data.key_press === correct_response) {
      correct = true
    }
    jsPsych.data.addDataToLastTrial({
      'correct_response': correct_response,
      'correct': correct
    })
  }
}


var practiceTrials = []
practiceTrials.push(feedback_block)
practiceTrials.push(instructions_block)
for (var i = 0; i < practice_length + 1; i++) {
  var practice_fixation_block = {
	  type: 'poldrack-single-stim',
	  stimulus: '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: "practice_fixation"
	  },
	  timing_post_trial: 0,
	  timing_stim: 500,
	  timing_response: 500,
	  prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
	  on_finish: function() {
		jsPsych.data.addDataToLastTrial({
		  exp_stage: exp_stage
		})
	  }
	}

	var practice_cue_block = {
	  type: 'poldrack-single-stim',
	  stimulus: getCue,
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: 'practice_cue'
	  },
	  timing_response: getCTI,
	  timing_stim: getCTI,
	  timing_post_trial: 0,
	  prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
	  on_finish: function() {
		jsPsych.data.addDataToLastTrial({
		  exp_stage: exp_stage
		})
		appendData()
	  }
	};
  practiceTrials.push(setStims_block)
  practiceTrials.push(practice_fixation_block)
  practiceTrials.push(practice_cue_block);
  practiceTrials.push(practice_block);
}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		practiceCount += 1
		task_switches = jsPsych.randomization.repeat(task_switches_arr, practice_length / lowestNumCond)
		task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(["go","go","go","go","nogo"],1).pop()})
		practiceStims = genStims(practice_length + 1)
		current_trial = 0
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
	
		for (var i = 0; i < data.length; i++){
			if ((data[i].trial_id == "practice_trial") && (data[i].go_no_go_condition == 'go')){
				total_trials+=1
				if (data[i].rt != -1){
					sum_rt += data[i].rt
					sum_responses += 1
					if (data[i].key_press == data[i].correct_response){
						correct += 1
		
					}
				}
		
			}
	
		}
	
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><i>Average reaction time:  " + Math.round(ave_rt) + " ms. 	Accuracy for trials that required a response: " + Math.round(accuracy * 100)+ "%</i>"

		if (accuracy > accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Done with this practice. Press Enter to continue.' 
			testStims = genStims(numTrialsPerBlock + 1)
			task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock /lowestNumCond)
			task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(["go","go","go","go","nogo"],1).pop()})
			return false
	
		} else if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_task_list 
			if (missed_responses > missed_thresh){
				feedback_text +=
						'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}
		
			if (practiceCount == practice_thresh){
				feedback_text +=
					'</p><p class = block-text>Done with this practice.' 
					testStims = genStims(numTrialsPerBlock + 1)
					task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock /lowestNumCond)
					task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(["go","go","go","go","nogo"],1).pop()})
					return false
			}
			
			feedback_text +=
				'</p><p class = block-text>Redoing this practice. Press Enter to continue.' 
			
			return true
		
		}
		
	}
}

var testTrials = []
testTrials.push(feedback_block)
testTrials.push(attention_node)
for (var i = 0; i < numTrialsPerBlock + 1; i++) {
  var fixation_block = {
	  type: 'poldrack-single-stim',
	  stimulus: '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: "fixation"
	  },
	  timing_post_trial: 0,
	  timing_stim: 500,
	  timing_response: 500,
	  on_finish: function() {
		jsPsych.data.addDataToLastTrial({
		  exp_stage: exp_stage
		})
	  }
	}

	var cue_block = {
	  type: 'poldrack-single-stim',
	  stimulus: getCue,
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: 'cue'
	  },
	  timing_response: getCTI,
	  timing_stim: getCTI,
	  timing_post_trial: 0,
	  on_finish: function() {
		jsPsych.data.addDataToLastTrial({
		  exp_stage: exp_stage
		})
		appendData()
	  }
	};
  testTrials.push(setStims_block)
  testTrials.push(fixation_block)
  testTrials.push(cue_block);
  testTrials.push(test_block);
}

var testCount = 0
var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
		testCount += 1
		task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / lowestNumCond)
		task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(["go","go","go","go","nogo"],1).pop()})
		testStims = genStims(numTrialsPerBlock + 1)
		current_trial = 0
	
		var total_trials = 0
		var sum_responses = 0
		var total_sum_rt = 0
		
		var go_trials = 0
		var go_correct = 0
		var go_rt = 0
		var sum_go_responses = 0
		
		var stop_trials = 0
		var stop_correct = 0
		var stop_rt = 0
		var sum_stop_responses = 0
		
	
		for (var i = 0; i < data.length; i++){
			if ((data[i].trial_id == "test_trial") && (data[i].go_no_go_condition == 'go')){
				total_trials+=1
				go_trials+=1
				if (data[i].rt != -1){
					total_sum_rt += data[i].rt
					go_rt += data[i].rt
					sum_go_responses += 1
					if (data[i].key_press == data[i].correct_response){
						go_correct += 1
		
					}
				}
		
			} else if ((data[i].trial_id == "test_trial") && (data[i].go_no_go_condition == 'nogo')){
				total_trials+=1
				stop_trials+=1
				if (data[i].rt != -1){
					total_sum_rt += data[i].rt
					stop_rt += data[i].rt
					sum_stop_responses += 1
					if (data[i].key_press == -1){
						stop_correct += 1
		
					}
				}
			
			}
	
		}
	
		var accuracy = go_correct / go_trials
		var missed_responses = (go_trials - sum_go_responses) / go_trials
		var ave_rt = go_rt / sum_go_responses
		var stop_acc = stop_correct / stop_trials
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text><i>Average reaction time:  " + Math.round(ave_rt) + " ms. 	Accuracy for trials that required a response: " + Math.round(accuracy * 100)+ "%</i>"
		feedback_text += "</p><p class = block-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
		if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_task_list 
		}
		if (missed_responses > missed_thresh){
			feedback_text +=
					'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}
	
		if (testCount == numTestBlocks){
			feedback_text +=
					'</p><p class = block-text>Done with this test. Press Enter to continue.'
			return false
		} else {
			feedback_text +=
					'</p><p class = block-text>Press Enter to continue.'
			return true
		}
	}
}

/* create experiment definition array */
var go_nogo_with_two_by_two_experiment = [];

go_nogo_with_two_by_two_experiment.push(practiceNode);
go_nogo_with_two_by_two_experiment.push(feedback_block);

go_nogo_with_two_by_two_experiment.push(start_test_block)
go_nogo_with_two_by_two_experiment.push(testNode);
go_nogo_with_two_by_two_experiment.push(feedback_block);

go_nogo_with_two_by_two_experiment.push(post_task_block)
go_nogo_with_two_by_two_experiment.push(end_block)