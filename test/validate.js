'use strict';

const fs = require('fs');
const md5 = require('js-md5');
const assert = require('assert');

before(function(){

    this.hasWebGL = !!PIXI.utils.isWebGLSupported();
    console.log("  PIXI.utils.isWebGLSupported:", this.hasWebGL);

    if (!this.hasWebGL) {
        const webglView = this.webglView = document.createElement('canvas');
        webglView.id = "webgl";
        webglView.width = 32;
        webglView.height = 32;
        document.body.appendChild(webglView);

        this.webgl = new PIXI.WebGLRenderer(32, 32, {
            view: webglView,
            backgroundColor: 0xffffff,
            antialias: false,
            preserveDrawingBuffer: true
        });
    }

    const canvasView = this.canvasView = document.createElement('canvas');
    canvasView.id = "canvas";
    canvasView.width = 32;
    canvasView.height = 32;
    document.body.appendChild(canvasView);

    this.canvas = new PIXI.CanvasRenderer(32, 32, {
        view: canvasView,
        backgroundColor: 0xffffff,
        antialias: false,
        preserveDrawingBuffer: true,
        roundPixels: true
    });
    this.canvas.smoothProperty = null;

    this.stage = new PIXI.Container();
    this.update = function() {
        if (!this.hasWebGL) {
            this.webgl.render(this.stage);
        }
        this.canvas.render(this.stage);
    };

    // Provide a function to validate the render of a canvas
    // against the data
    const solutions = require(__dirname + '/solutions.json'); 

    this.validate = function(testId) {
        this.update();
        if (!this.hasWebGL) {
            assert.equal(
                solutions[testId].webgl, 
                md5(this.webglView.toDataURL()), 
                'WebGL solution for "' + testId + '" failed'
            );
        }
        assert.equal(
            solutions[testId].canvas, 
            md5(this.canvasView.toDataURL()), 
            'Canvas solution for "' + testId + '" failed'
        );
    };
});

// Delete and remove the canvas
after(function(){
    this.stage.destroy(true);
    if (!this.hasWebGL) {
        this.webgl.destroy();
        this.webgl = null;
        this.webglView = null;
        this.webglView.parentNode.removeChild(this.webglView);
    }
    this.canvas.destroy();
    this.canvas = null;
    this.canvasView.parentNode.removeChild(this.canvasView);
    this.canvasView = null;
    this.stage = null;
    this.validate = null;
    this.update = null;
});

// Remove all children, cleanup
beforeEach(function(){
    this.stage.removeChildren();
    this.update();
});

afterEach(function(){
    this.stage.removeChildren();
    this.update();
});