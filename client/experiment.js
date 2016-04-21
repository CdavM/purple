Template.experiment.events({
  'click #begin_experiment': function (event) {
    worker_ID_value = Session.get("worker_ID_value");
    Session.set('initialized', true);
    Session.set('waiting', true);
    Meteor.call('initialPost', {worker_ID: worker_ID_value, initial_time: initial_time_val}, 'begin', function(error, result){
      if (error){
        console.log("error "+error);
      } else {
        initial_time_val = new Date().getTime();
      }
    });

  },

  'click #more_instructions': function (event) {
    window.open('/more_instructions');
  },

  'click #answer_submission': function(event) {
    var answer_value = {};
    var form = $("form").children();
    //for checkboxes, radio buttons
    form.filter("label").children().filter(":checked").each(function(index, element){
      //append the values to the answer array
      if (!answer_value[$(element)[0].form.name]){
        answer_value[$(element)[0].form.name]= [$(element).val()];
      } else {
        answer_value[$(element)[0].form.name].push($(element).val());
      }
    });
    //for the button
    if (event.target.parentNode.name){
      answer_value[event.target.parentNode.name] = event.target.value;
    }
    //for textares
    form.filter("textarea").each(function(index, element){
      if ($(element).val() != " "){
        if (!answer_value[$(element).parent().attr('name')]){
          answer_value[$(element).parent().attr('name')]= [$(element).val()];
        } else {
          answer_value[$(element).parent().attr('name')].push($(element).val());
        }
      }
    });
    if (Object.keys(answer_value).length != $("form").length){
      alert("Please make sure to answer every question.");
      return;
    }
    worker_ID_value = Session.get('worker_ID_value');
    answer_value['time'] = new Date().getTime() - initial_time_val; 
    Session.set("answered", true);
    Session.set("waiting", true);
    Meteor.call('newPost', {answer: answer_value, worker_ID: worker_ID_value}, function(error, result){
      if (error) {
        console.log("Error " + error + " occured. Please contact the administrators with the issue.");
      } else if (Answers.findOne({worker_ID: worker_ID_value}).experiment_finished){
        Session.set('experiment_finished', true);
        Router.go('/end');
      } else{
        Session.set('waiting', false);
      }
    });
  }

});
Template.experiment.helpers({
  questions: function() {
    worker_ID_value = Session.get('worker_ID_value');
    var curr_experiment = Answers.findOne({worker_ID: worker_ID_value});
    if (curr_experiment){
      //update average payment
      current_payment = curr_experiment.avg_payment;
      Session.set('current_payment', current_payment);
    }
    if (curr_experiment && (!Session.equals('current_question', curr_experiment.current_question))) {
      Session.set("current_question", curr_experiment.current_question);
      Session.set("waiting", false);
    } else {
      return Questions.find({question_ID: Session.get("current_question")});   
    }
  }
});
Template.question.helpers({
    formula: function(){


    //all mechs
    /**
    return ["Suppose that Sam’s answer is a and Lisa’s answer is b.  Now Sam’s reward is calculated as follows. First, for every one of the remaining 99 managers, the HR examiner randomly picks one employee per manager (out of the two employees). If the collection of answers of these employees does not have two ‘Yes’  answers and two ‘No’ answers, then Sam does not get any reward. ", "If not, then choose two employees from the set of 99 randomly chosen employees whose answer is the same as that of Sam. Suppose these employees are Robert and Tim. Let Robert’s co-worker (who works under the same manager as him) be Martha and let Tim’s co-worker be Karen. The payment to Sam is then as follows:",
    "He gets a base reward of $\\frac{1}{2}$", "He gets an additional reward of 1 if Lisa’s answer is same as Martha’s answer.", "But his reward reduces by $\\frac{1}{2}$ if Martha’s answer is the same as Karen’s.","If the two coworkers give different answers then they don’t get any reward. If the two co-workers give the same answer then first they get a reward of 1. But then the HR examiner chooses a random employee that works with some other manager. If that employee also gives the same answer for his/her manager, then the two coworkers get no reward, otherwise they get to keep their reward of 1.","If the two co-workers give the same answer, and if it is yes, then at the end both co-workers receive a payment $R_{yes}$. If this answer is No, then both of them receive a payment $R_{no}$. If their answers differ, they do not get anything.", "Here is how $R_{yes}$ and $R_{no}$ will be computed. $R_{yes}$ is inversely proportional to a popularity score of the answer yes and $R_{no}$ is inversely proportional to the popularity score of the answer No: thus higher the popularity score of the answer, lower the reward for matching on that answer and vice versa. i.e.", " $R_{yes} = \\frac{1}{Popularity_{yes}}$                $R_{no}=\\frac{1}{Popularity_{no}}$"," The popularity scores of the two answers are computed in the following way. Let $N_{yes}$ be the number of managers who received the answer ‘yes’ from both employees. And $N_{no}$ be the number of managers who received ‘no’ from both employees.",
    "$Popularity_{yes} = (\\frac{N_{yes}}{100})$        $Popularity_{no} = (\\frac{N_{no}}{100})$"," Thus popularity score of an answer is the fraction of managers who received that answer from both their employees. ","If the two co-workers give the same answer, and if it is yes, then at the end both co-workers receive a payment $R_{yes}$. If this answer is No, then both of them receive a payment $R_{no}$. If their answers differ, they do not get anything.", "Here is how $R_{yes}$ and $R_{no}$ will be computed. $R_{yes}$ is inversely proportional to a popularity score of the answer yes and $R_{no}$ is inversely proportional to the popularity score of the answer No: thus higher the popularity score of the answer, lower the reward for matching on that answer and vice versa. i.e.", " $R_{yes} = \\frac{1}{Popularity_{yes}}$                $R_{no}=\\frac{1}{Popularity_{no}}$"," The popularity scores of the two answers are computed in the following way. Let $N_{yes}$ be the number of managers who received the answer ‘yes’ from both employees. And $N_{no}$ be the number of managers who received ‘no’ from both employees.",
    "$Popularity_{yes} = (\\frac{N_{yes}}{100})^{0.5}$        $Popularity_{no} = (\\frac{N_{no}}{100})^{0.5}$"," Thus popularity score of an answer is the square root of the fraction of managers who received that answer from both their employees. "];
    */

    worker_ID_value = Session.get('worker_ID_value');
    var curr_experiment = Answers.findOne({worker_ID: worker_ID_value});
    var curr_q = curr_experiment.current_question;
    //console.log("current question is " + curr_q);
    if (typeof curr_q != 'undefined'){
      if (curr_q == 0){
        //mech 1
        return ["If the two co-workers give the same answer, and if the answer is 'yes', then at the end both co-workers receive a payment $R_{yes}$. If this answer is 'no', then both of them receive a payment $R_{no}$. If their answers differ, they do not get anything.", "Here is how $R_{yes}$ and $R_{no}$ will be computed.Let $N_{yes}$ be the number of managers who received the answer ‘yes’ from both employees. And $N_{no}$ be the number of managers who received ‘no’ from both employees. Then", "$R_{yes} = (\\frac{100}{N_{yes}})^{0.5}$        $R_{no} = (\\frac{100}{N_{no}})^{0.5}$","Thus the payment for matching on an answer is inversely proportional to the square root of the number of managers who received that answer from both their employees: the bigger the number the smaller is the payment."];
      } else if (curr_q == 1){
        //mech2
        return ["If the two co-workers give the same answer, and if the answer is 'yes', then at the end both co-workers receive a payment $R_{yes}$. If this answer is 'no', then both of them receive a payment $R_{no}$. If their answers differ, they do not get anything.", "Here is how $R_{yes}$ and $R_{no}$ will be computed.Let $N_{yes}$ be the number of managers who received the answer ‘yes’ from both employees. And $N_{no}$ be the number of managers who received ‘no’ from both employees. Then", " $R_{yes} = \\frac{100}{N_{yes}}$                $R_{no}=\\frac{100}{N_{no}}$",
        "Thus the payment for matching on an answer is inversely proportional to the number of managers who received that answer from both their employees: the bigger the number the smaller is the payment."];
      } else if (curr_q == 2){
      //mech 3 (hetero additive)
      return ["The payment mechanism has two steps. In the first step, if Sam and Lisa give different answers then Sam does not get any payment. If they give the same answer then he gets a payment of 1.", "In the second step, the HR examiner chooses a random employee that works with some other manager. If that employee also gives the same answer for his/her manager as that given by Sam, then Sam has to pay 1 back to the HR examiner."];
      } else if (curr_q == 3){
        //mech 4 (RF)
    return ["Sam’s payment is calculated as follows. First, for every one of the remaining 99 managers, the HR examiner randomly picks one employee per manager (out of the two employees). This collection of answers of these employees must have at least two ‘Yes’ answers and two ‘No’ answers for the mechanism to proceed. If this condition is not satisfied, then Sam does not get any payment.", "If the condition is satisfied, then choose two employees from the set of 99 randomly chosen employees whose answer is the same as that of Sam. Suppose these employees are Robert and Tim. Let Robert’s co-worker (who works under the same manager as him) be Martha and let Tim’s co-worker be Karen. The payment to Sam is then as follows:",
    "He gets a base payment of $\\frac{1}{2}$", "He gets an additional payment of 1 if Lisa’s answer is same as Martha’s answer.", "But his payment reduces by $\\frac{1}{2}$ if Martha’s answer is the same as Karen’s."];
      } else if (curr_q == 4){
        //mech 1 twisted
        return ["If the two co-workers give the same answer, and if the answer is 'yes', then at the end both co-workers pay a penalty $R_{yes}$. If this answer is 'no', then both of them pay a penalty $R_{no}$. If their answers differ, they do not pay anything.", "Here is how $R_{yes}$ and $R_{no}$ will be computed. Let $N_{yes}$ be the number of managers who received the answer ‘yes’ from both employees. And $N_{no}$ be the number of managers who received ‘no’ from both employees. Then",
        "$R_{yes} = (\\frac{100}{N_{yes}})^{0.5}$        $R_{no} = (\\frac{100}{N_{no}})^{0.5}$", "Thus the penalty for matching on an answer is inversely proportional to the square root of the number of managers who received that answer from both their employees: The bigger the number the smaller is the penalty."];
      } else if (curr_q == 5){
        //mech 2 twisted
        return ["If the two co-workers give the same answer, and if the answer is 'yes', then at the end both co-workers pay a penalty $R_{yes}$. If this answer is 'no', then both of them pay a penalty $R_{no}$. If their answers differ, they do not pay anything.", "Here is how $R_{yes}$ and $R_{no}$ will be computed. Let $N_{yes}$ be the number of managers who received the answer ‘yes’ from both employees. And $N_{no}$ be the number of managers who received ‘no’ from both employees. Then",
        "$R_{yes} = \\frac{100}{N_{yes}}$        $R_{no} = \\frac{100}{N_{no}}$", "Thus the penalty for matching on an answer is inversely proportional to the number of managers who received that answer from both their employees: The bigger the number the smaller is the penalty."];
      } else if (curr_q == 6){
        //mech 3 twisted
        return ["The penalty mechanism has two steps. In the first step, if Sam and Lisa give different answers then Sam does not incur any penalty. If they give the same answer then he incurs a penalty of 1.", "In the second step, the HR examiner chooses a random employee that works with some other manager. If that employee also gives the same answer for his/her manager as that given by Sam, then the HR examiner pays 1 back to Sam."];
      } else if (curr_q == 7){
        //mech 4 twisted(RF)
        return ["Sam’s payment is calculated as follows. First, for every one of the remaining 99 managers, the HR examiner randomly picks one employee per manager (out of the two employees). This collection of answers of these employees must have at least two ‘Yes’ answers and two ‘No’ answers for the mechanism to proceed. If this condition is not satisfied, then Sam does not incur any penalty.",
        "If the condition is satisfied, then choose two employees from the set of 99 randomly chosen employees whose answer is the same as that of Sam. Suppose these employees are Robert and Tim. Let Robert’s co-worker (who works under the same manager as him) be Martha and let Tim’s co-worker be Karen. Sam’s penalty is then as follows:", "He incurs a base penalty of $\\frac{1}{2}$", "He gets an additional penalty of 1 if Lisa’s answer is same as Martha’s answer.","But he gets a reward of $\\frac{1}{2}$ if Martha’s answer is the same as Karen’s."];
      } 
    }
  }
});
