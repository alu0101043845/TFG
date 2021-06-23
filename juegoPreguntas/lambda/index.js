/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const questionlist = require('./question-list.js');
var currentIndex = null;
var currentStatus = null;
var count = 0;
var hits = 0;
var pending = null;


function getRandomItem (obj) {
    if (Object.keys(obj).length === 0){
        currentIndex = null;
    } else {
        currentIndex = obj[Object.keys(obj)[Math.floor(Math.random()*Object.keys(obj).length)]];
    }
    
    return currentIndex;

}

function getNewQuestion () {
    let speechText = '';
    speechText = getRandomItem(questionlist);
    if (currentIndex === null && pending === null){
        return 'ya respondiste las preguntas! ... Has acertado '+hits+' de '+ count + ' preguntas. ';
    }else if ( currentIndex === null){
        currentIndex = pending;
        pending = null;
        return 'ya no te quedan más preguntas nuevas, pero si te queda una pendiente, vamos a por ella. '+ getQuestion();
    }
    delete questionlist[currentIndex.id];
    count++;
    const speakOutput = getQuestion();
    return speakOutput;
}

function getQuestion() {
    const speakOutput = '¿En qué año ' + currentIndex.question + '?';
    return speakOutput;
}

function getClue() {
    return currentIndex.clue;
}

function getYear(){
    return currentIndex.year;
}

function getAnswer(){
    return currentIndex.answer;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        currentIndex = null;
        currentStatus = null;
        count = 0;
        hits = 0;
        pending = null;
        const questionText = getNewQuestion();
        const speakOutput = "Bienvenido, empecemos, " + questionText;
        currentStatus = 'Question';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const AnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    
    handle(handlerInput) {
	
        const AnswerValue = handlerInput.requestEnvelope.request.intent.slots.numberSlot.value;
        let speakOutput = '';
        if (currentStatus === 'Continue'){
            speakOutput += 'Responde si o no';
        } else {
            speakOutput += "Respondiste " + AnswerValue;
            if (AnswerValue == getYear()){
                speakOutput += '. Respuesta correcta, el año ' + getYear() + ' es verdadero porque ' + getAnswer();
                hits++;
            } else {
                speakOutput += '. Respuesta incorrecta, el año correcto es ' + getYear() + ' porque ' + getAnswer();
            }
        }
        
        currentIndex = null;
        speakOutput += "...Continuamos? ";
        currentStatus = 'Continue';
        
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    
    handle(handlerInput) {
        const speakOutput = getNewQuestion();
        currentStatus = 'Question';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const ClueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ClueIntent';
    },
    
    handle(handlerInput) {
        let speakOutput='';
        if (currentStatus === 'Question'){
            speakOutput += 'Ahí va la pista ' + getClue() + ', te la vuelvo a preguntar ' + getQuestion();
        } else if (currentStatus === 'Continue'){
            speakOutput += 'Responde Si o No.';
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
    },
    
    handle(handlerInput) {
        let speakOutput='';
        if (currentStatus === 'Question'){
            speakOutput += 'Repetimos!... ' + getQuestion();
        } else if (currentStatus === 'Continue'){
            speakOutput += 'Continuamos? ';
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const NextIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent';
    },
    handle(handlerInput) {
        let speakOutput='';
        if (currentStatus == 'Continue'){
            speakOutput = getNewQuestion();
            currentStatus = 'Question';
        } else {
            if (pending !== null){
                speakOutput = 'Alcanzaste el máximo de preguntas pendientes de responder, vamos a por ella de nuevo...';
                const tmpIndex = currentIndex;
                currentIndex = pending;
                pending = tmpIndex;
                speakOutput+= getQuestion();
            }
            else{
                speakOutput ='Guardamos esta pregunta para después, vamos con la siguiente! ...';
                pending = currentIndex;
                speakOutput += getNewQuestion();
            }
            currentStatus = 'Question';
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const PendingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PendingIntent';
    },
    
    handle(handlerInput) {
        let speakOutput='';
        if (pending === null){
            if (currentIndex !== null && currentStatus === 'Question'){
                speakOutput += 'Hemos dejado esta pregunta sin responder, la guardamos para despues... ';
                pending = currentIndex;
            }
            speakOutput = 'no tienes preguntas pendientes! ... Quieres continuar con una pregunta? ';
            currentStatus = 'Continue';
        }else{
            if(currentIndex !== null && currentStatus === 'Question'){
                const tmpIndex = currentIndex;
                currentIndex = pending;
                pending = currentIndex;
                speakOutput += 'Hemos dejado esta pregunta sin responder, la guardamos para despues ...';
            } else {
                currentIndex = pending;
                pending = null;
            }
            speakOutput = 'Vamos con la pregunta que teníamos pendiente! ... '+ getQuestion();
            currentStatus = 'Question';
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = 'Has conseguido acertar ' + hits + 'de ' + count + ' preguntas, ... hasta luego!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AnswerIntentHandler,
        YesIntentHandler,
        ClueIntentHandler,
        RepeatIntentHandler,
        NextIntentHandler,
        PendingIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();