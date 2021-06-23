/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const lists = require('./lists.js');
var op = 0;
var simon = [];
var currentStatus = null;
var count = 0;
var level = 1;


function getRandomItem (obj) {
    if (Object.keys(obj).length === 0)
        return null;
    else
        return obj[Object.keys(obj)[Math.floor(Math.random()*Object.keys(obj).length)]];
}

function addItem () {
    simon.push(getRandomItem(lists[op-1]));
}

function toString (array) {
    let str = "";
    let i = 0;
    for(i = 0; i < array.length - 1 ; i++){
        str += array[i] + ", ";
    }
    str += array[i];
    return str;
}


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        simon = [];
        count = 0;
        op = 0;
        const speakOutput = "Bienvenido, empecemos, con qué tipo de palabras quiere jugar? Las opciones son, uno colores. 2 animales. 3 paises. 4 todas las opciones anteriores mezcladas. Por favor diga el número de opción con la que desea jugar... si quiere saber las instrucciones diga ayuda";
        currentStatus = 'Option';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



const ChangeOptionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChangeOptionIntent';
    },
    handle(handlerInput) {
        simon = [];
        count = 0;
        op = 0;
        const speakOutput = "De acuerdo cambiemos de opción. Las posibles opciones son, uno colores. 2 animales. 3 paises. 4 todas las opciones anteriores mezcladas. Por favor diga el número de opción con la que desea jugar.";
        currentStatus = 'Option';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const OptionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OptionIntent';
    },
    
    handle(handlerInput) {
	
        const AnswerValue = parseInt(handlerInput.requestEnvelope.request.intent.slots.optionSlot.value);
        let speakOutput = '';
        
        if (AnswerValue > 0 && AnswerValue < 5) {
            op = AnswerValue;
            switch (op){
                case 1:
                    speakOutput += "Escogiste la opción uno, colores. ";
                    break;
                case 2:
                    speakOutput += "Escogiste la opción 2, animales. ";
                    break;
                case 3:
                    speakOutput += "Escogiste la opción 3, paises. ";
                    break;
                case 4:
                    speakOutput += "Escogiste la opción 4, mezcla. ";
            }
            simon = [];
            count = 0;
            addItem();
            let simonStr = toString(simon);
            speakOutput += "Comencemos, Simón dice " + simonStr;
            currentStatus = 'Simon';
        } else {
            speakOutput += "opción no válida. Las opciones son, uno colores. 2 animales. 3 paises. 4 todas las opciones anteriores mezcladas. Por favor diga el número de opción con la que desea jugar. ";
        }
         
        
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
	
       let speakOutput = '';
	   let AnswerValue;
	    switch(op){
	        case 1: 
                AnswerValue = handlerInput.requestEnvelope.request.intent.slots.colorSlot.value;
                break;
	        case 2: 
                AnswerValue = handlerInput.requestEnvelope.request.intent.slots.animalSlot.value;
                break;
	        case 3: 
                AnswerValue = handlerInput.requestEnvelope.request.intent.slots.paisSlot.value;
                break;
            case 4: 
                if(handlerInput.requestEnvelope.request.intent.slots.colorSlot.value !== undefined)
                    AnswerValue = handlerInput.requestEnvelope.request.intent.slots.colorSlot.value;
                else if(handlerInput.requestEnvelope.request.intent.slots.animalSlot.value !== undefined)
                    AnswerValue = handlerInput.requestEnvelope.request.intent.slots.animalSlot.value;
                else
                    AnswerValue = handlerInput.requestEnvelope.request.intent.slots.paisSlot.value;
	    }
        
        if (currentStatus === 'Simon') {
            if (AnswerValue === simon[count]){
                count++;
        
                if(count === simon.length){
                    count = 0;
                    level = simon.length;
                    speakOutput += '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/> Correcto. Continuamos... ';
                    addItem();
                    let simonStr = toString(simon);
                    speakOutput += "Simón dice " + simonStr;
                    currentStatus = 'Simon';
                } else
                    //speakOutput += '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_neutral_response_02"/>';
                    speakOutput += '<audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_06"/>';
            } else {
                count = 0;
                level = simon.length;
                simon =[];
                speakOutput += '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_negative_response_01"/> Incorrecto. Volvemos a empezar? ';
                currentStatus = 'Restart';
            }
        }
        
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
        
        if(currentStatus === 'Restart'){
            simon = [];
            count = 0;
            addItem();
            let simonStr = toString(simon);
            const speakOutput = "Empecemos de nuevo, Simón dice " + simonStr;
            currentStatus = 'Simon';
                    
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};


const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
    },
    
    handle(handlerInput) {
        let speakOutput='';
        if (currentStatus === 'Simon'){
            count = 0;
            let simonStr = toString(simon);
            speakOutput += 'Repetimos!... ' + "Simón dice " + simonStr;
        } else if (currentStatus === 'Option') {
            speakOutput +=  " Con qué tipo de palabras quiere jugar? Las opciones son, 1 colores. 2 animales. 3 paises. 4 todas las opciones anteriores mezcladas. Por favor diga el número de opción con la que desea jugar.";
        } else {
            speakOutput += ' Empezamos de nuevo? ';
            currentStatus = 'Restart';
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
        const speakOutput = 'Hola mundo!';

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
        let speakOutput = "En este juego primero se selecciona el tipo de palabras con el que se quiere jugar... a continuación se dirán series de palabras...  ";
        speakOutput += " Cuando se vaya a responder diga las palabras de una en una, esperando a la confirmación de cada palabra, que se hará con un sonido...  ";
        speakOutput += " Si quiere volver a escuchar la series de palabras actual diga otra vez o repite, tras esto empiece a contestar desde el principio...  ";
        speakOutput += " Y si quiere cambiar de tipo de palabras con las que jugar diga otra opción o cambia la opción";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        
            simon = [];
            count = 0;
        const speakOutput = 'Has conseguido llegar al nivel ' + level + ', hasta luego!';

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
        const speakOutput = 'Lo siento, no sé sobre eso. Por favor inténtalo de nuevo.';

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
        console.log(`~~~~ Sesión acabada: ${JSON.stringify(handlerInput.requestEnvelope)}`);
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
        const speakOutput = `Has lanzado ${intentName}`;

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
        const speakOutput = 'Lo siento, tuve problemas para hacer lo que pediste. Por favor inténtalo de nuevo.';
        console.log(`~~~~ Error gestionado: ${JSON.stringify(error)}`);

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
        HelpIntentHandler,
        ChangeOptionIntentHandler,
        OptionIntentHandler,
        AnswerIntentHandler,
        YesIntentHandler,
        RepeatIntentHandler,
        HelloWorldIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();