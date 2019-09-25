/**
 * Sprite class with a rotation velocity.
 */



 import {
   
    PixiAppWrapper as Wrapper,
    
} from "pixi-app-wrapper";


/**
     * Container Class which contains Fire particles animation
*/

export class fireView extends PIXI.Container {
   
    private sheet: any;
    private app: Wrapper;
    private fx: any;
    private container :PIXI.Container;
    private wood: any;
    private emitter:any;

    
    constructor(sheet:any,app:Wrapper,fx:any) {
        
        super();
        this.app = app;
        this.sheet = sheet;
        this.fx = fx;
        
        this.init();
    }

    private init():void{

        this.container =  new PIXI.Container();
        this.addChild(this.container);

        this.wood = PIXI.Sprite.from(this.sheet.textures["wood"]);
        this.container.addChild(this.wood);
        this.wood.anchor.set(0.5, 0.15);
        this.wood.x = 0;
        this.wood.y = 200;

        const emitter:any = this.fx.getParticleEmitter('top-flamethrower');

        //Inititialize it with the target PIXI container
        emitter.init(this.container,true, 3);

        emitter.settings.spawnCountMin = 10;
        emitter.settings.spawnCountMax = 30;
        emitter.settings.useGravity = true;
        emitter.settings.gravity = - 0.1;

       
        emitter.target = this.wood;
        emitter.paused = true;

        this.emitter = emitter;
    }

    startEmitter(){
        this.emitter.paused = false;
    }
    
    stopEmitter(){
        this.emitter.paused = true;
    }
}


