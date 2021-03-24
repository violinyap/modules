(function () {
    'use strict';

    (function() {
        const env = {};
        try {
            if (process) {
                process.env = Object.assign({}, process.env);
                Object.assign(process.env, env);
                return;
            }
        } catch (e) {} // avoid ReferenceError: process is not defined
        globalThis.process = { env:env };
    })();

    var WIDTH=400;var HEIGHT=300;var videoElement;var canvasElement;var canvasRenderingContext;var errorLogger;var pixels=[];var temporaryPixels=[];var filter=copy_image;var videoIsPlaying=false;var FPS=10;var startTime;function setupData(){for(var i=0;i<WIDTH;i+=1){pixels[i]=[];temporaryPixels[i]=[];}}function isPixelFilled(pixel){var ok=true;for(var i=0;i<4;i+=1){if(pixel[i]>=0&&pixel[i]<=255){continue}ok=false;pixel[i]=0;}return ok}function writeToBuffer(buffer,data){var ok=true;for(var i=0;i<HEIGHT;i+=1){for(var j=0;j<WIDTH;j+=1){var p=i*WIDTH*4+j*4;if(isPixelFilled(data[i][j])===false){ok=false;}buffer[p]=data[i][j][0];buffer[p+1]=data[i][j][1];buffer[p+2]=data[i][j][2];buffer[p+3]=data[i][j][3];}}if(!ok){var warningMessage="You have invalid values for some pixels! Reseting them to default (0)";console.warn(warningMessage);errorLogger(warningMessage,false);}}function readFromBuffer(pixelData,src){for(var i=0;i<HEIGHT;i+=1){for(var j=0;j<WIDTH;j+=1){var p=i*WIDTH*4+j*4;src[i][j]=[pixelData[p],pixelData[p+1],pixelData[p+2],pixelData[p+3]];}}}function drawFrame(){canvasRenderingContext.drawImage(videoElement,0,0,WIDTH,HEIGHT);var pixelObj=canvasRenderingContext.getImageData(0,0,WIDTH,HEIGHT);readFromBuffer(pixelObj.data,pixels);try{filter(pixels,temporaryPixels);writeToBuffer(pixelObj.data,temporaryPixels);}catch(e){console.error(JSON.stringify(e));var errMsg="There is an error with filter function, filter will be reset to default. "+e.name+": "+e.message;console.error(errMsg);if(!e.name){errorLogger("There is an error with filter function (error shown below). Filter will be reset back to the default. If you are facing an infinite loop error, you can consider increasing the timeout period (clock icon) at the top / reducing the video dimensions.");errorLogger([e],true);}else {errorLogger(errMsg,false);}filter=copy_image;filter(pixels,temporaryPixels);}canvasRenderingContext.putImageData(pixelObj,0,0);}function draw(timestamp){window.requestAnimationFrame(draw);if(startTime==null)startTime=timestamp;var elapsed=timestamp-startTime;if(elapsed>1000/FPS){drawFrame();startTime=timestamp;}}function startVideo(){if(videoIsPlaying)return;videoIsPlaying=true;window.requestAnimationFrame(draw);}function loadMedia(){if(!navigator.mediaDevices.getUserMedia){var errMsg="The browser you are using does not support getUserMedia";console.error(errMsg);errorLogger(errMsg,false);}if(videoElement.srcObject!=null)return;navigator.mediaDevices.getUserMedia({video:true}).then(function(stream){videoElement.srcObject=stream;}).catch(function(error){var errorMessage=error.name+": "+error.message;console.error(errorMessage);errorLogger(errorMessage,false);});startVideo();}function init(){return {toReplString:function(){return "[Pix N Flix]: Video { ... }"},init:function(video,canvas,_errorLogger){videoElement=video;canvasElement=canvas;errorLogger=_errorLogger;var context=canvasElement.getContext("2d");if(context==null)throw new Error("Canvas context should not be null.");canvasRenderingContext=context;setupData();loadMedia();}}}function video_height(){return HEIGHT}function video_width(){return WIDTH}function copy_image(src,dest){for(var i=0;i<HEIGHT;i+=1){for(var j=0;j<WIDTH;j+=1){dest[i][j]=src[i][j];}}}function install_filter(_filter){filter=_filter;}var index = (function(){return {init:init,install_filter:install_filter,copy_image:copy_image,video_height:video_height,video_width:video_width}});

    return index;

}());
