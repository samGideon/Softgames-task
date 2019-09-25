import {FX} from 'revolt-fx';
import {TweenLite} from "gsap";
import {cardView} from "app/card-view";
import {textView} from "app/text-view";
import { fireView } from 'app/fire-view';

import {
    Dom,
    PixiAppWrapper as Wrapper,
    pixiAppWrapperEvent as WrapperEvent,
    PixiAppWrapperOptions as WrapperOpts,
} from "pixi-app-wrapper";

import "pixi-particles";

/**
 *  Task App
 */
export class SampleApp {

    private app: Wrapper;
    private dimensions:any = {};

    private sheet: any;
    private fx: any;
    private gameScale:number;

    private background:PIXI.Sprite;
    private backBtn:PIXI.Sprite;

    private menuContainer:PIXI.Container = new PIXI.Container();
    private cardContainer:PIXI.Container = new PIXI.Container();
    private textToolContainer:PIXI.Container = new PIXI.Container();
    private fireEffectContainer:PIXI.Container = new PIXI.Container();

    constructor() {
        const canvas = Dom.getElementOrCreateNew<HTMLCanvasElement>("app-canvas", "canvas", document.getElementById("app-root"));

        const appOptions: WrapperOpts = {
            width: 640,
            height: 960,
            scale: "keep-aspect-ratio",
            align: "middle",
            resolution: window.devicePixelRatio,
            roundPixels: true,
            transparent: false,
            backgroundColor: 0xfff000,
            view: canvas,
            showFPS: true,
            changeOrientation: true,
        };

        this.app = new Wrapper(appOptions);
        this.app.on(WrapperEvent.RESIZE_START, this.onResizeStart.bind(this));
        this.app.on(WrapperEvent.RESIZE_END, this.onResizeEnd.bind(this));

        // Revolt FX particles Class
        const fx = new FX();
        this.fx = fx;

        // Preloading Assets
        PIXI.loader
        .add("assets/atlas/sheet.json")
        .add('fx_settings', 'assets/gfx/default-bundle.json')
        .add('fx_spritesheet', 'assets/gfx/revoltfx-spritesheet.json')
        .add('example_spritesheet', 'assets/gfx/rfx-examples.json')
        .load(function (loader :any, resources:any) {
		
            //Loading Spritesheet
            this.sheet = PIXI.loader.resources["assets/atlas/sheet.json"];

            fx.initBundle(resources.fx_settings.data);
                    
            this.app.ticker.add(function () {
                //Update the RevoltFX instance
                fx.update();
            });

            this.createViews(); 
    
        }.bind(this));
    }

    private onResizeStart(): void {
    }

    private onResizeEnd(args: any): void {
        this.findOffsets();
        this.relocateViews();
    }

   

    private createViews(): void {
       
        // Bacground
        let background:PIXI.Sprite = new PIXI.Sprite(this.sheet.textures["bg1"]);

        this.background = background;
        this.background.anchor.x = 0.5;
        this.background.anchor.y = 0.5;
        
        this.findOffsets();
        this.app.stage.addChild(background);

        this.addMenus();

        this.cardContainer = new cardView(this.sheet,this.app); // card container
        this.textToolContainer = new textView(this.sheet,this.app); // Text tool container
        this.fireEffectContainer = new fireView(this.sheet,this.app,this.fx);// Fire Particles container

        this.textToolContainer.visible = false;
        this.textToolContainer.visible = false;
        this.cardContainer.visible = false;
        this.fireEffectContainer.visible = false;

        this.backBtn = new PIXI.Sprite(this.sheet.textures["home"]); // Back or home Btn
        this.backBtn.scale.x = this.backBtn.scale.y = 0.5;
        this.backBtn.anchor.x = this.backBtn.anchor.y = 0.5;
        this.backBtn.x = this.dimensions.rightOffset - 150;
        this.backBtn.y = this.dimensions.topOffset + 100;
        
        this.backBtn.interactive = true;
        this.backBtn.buttonMode = true;
        this.backBtn.visible = false;
        this.backBtn.on('pointerdown', this.backButtonDown.bind(this,this.backBtn));

        this.app.stage.addChild(this.backBtn);

        this.app.stage.addChild(this.menuContainer);
        this.app.stage.addChild(this.cardContainer);
        this.app.stage.addChild(this.textToolContainer);
        this.app.stage.addChild(this.fireEffectContainer);
        this.relocateViews();
    }

    private backButtonDown(btn:PIXI.Sprite):void{
        btn.visible = false;
         if(this.cardContainer.visible){
            (this.cardContainer as any).reset();
            this.cardContainer.visible = false;
         }else if(this.textToolContainer.visible){
            this.textToolContainer.visible = false;
         }else if(this.fireEffectContainer.visible){
            (this.fireEffectContainer as any).stopEmitter();
            this.fireEffectContainer.visible = false;
         }
        
        TweenLite.to(this.menuContainer, 0.5, {x:this.dimensions.gameWidth/2, alpha:1, ease:"Linear.easeOut"});
    }

    private findOffsets(){

        let ratio :number = 0;

        this.dimensions.gameWidth = 640;
        this.dimensions.gameHeight = 960;

        if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI)
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
        else if (window.devicePixelRatio !== undefined)
        ratio = window.devicePixelRatio;

        this.dimensions.fullWidth = window.innerWidth * ratio;
        this.dimensions.fullHeight = window.innerHeight * ratio;

        let scaleX = this.dimensions.fullWidth / this.dimensions.gameWidth;
        let scaleY = this.dimensions.fullHeight / this.dimensions.gameHeight;

        this.gameScale = (scaleX < scaleY) ? scaleX : scaleY;

        this.dimensions.actualWidth = this.app.view.width / this.gameScale;
        this.dimensions.actualHeight = this.app.view.height / this.gameScale;

        this.dimensions.leftOffset = - (this.dimensions.actualWidth - this.dimensions.gameWidth) / 2;
        this.dimensions.rightOffset = this.dimensions.gameWidth - this.dimensions.leftOffset;
        this.dimensions.topOffset = - (this.dimensions.actualHeight - this.dimensions.gameHeight) / 2;
        this.dimensions.bottomOffset = this.dimensions.gameHeight - this.dimensions.topOffset;


        if( window.innerWidth < window.innerHeight){
            this.dimensions.gameWidth = 640;
            this.dimensions.gameHeight = 960;
        }else{
            this.dimensions.gameWidth = 960;
            this.dimensions.gameHeight = 640;
        }
        
    
    }

    
    /**
     *  Adding Menu 
     */

    private addMenus():void{
        
        let startY:number = 0 - 200;

        let types :Array<string> = ["CARDS", "TEXT","PARTICLES"];
        for (let i = 0; i < 3; i++) {

            const btn:any = new PIXI.Sprite(this.sheet.textures["btn"]);
            btn.anchor.x = btn.anchor.y = 0.5;
            btn.x = 0;
            btn.y = startY;

           
            btn.index = i+1;

            let text :  PIXI.Text = this.getText(types[i],35);
            text.x -=  text.width/2;
            text.y -=  text.height/2;
            btn.addChild(text);
            this.menuContainer.addChild(btn);
            
            btn.interactive = true;
            btn.buttonMode = true;
            btn.on('pointerdown', this.onButtonDown.bind(this,btn));

            startY += 200;

            let dist:number = 200;
            if(i % 2) dist *= -1;
            TweenLite.from(btn, 0.35, {x:dist, alpha:0, ease:"Linear.easeOut"});
        }

        
    }

    /**
     *  Loading The container based on selection
     */

    private onButtonDown(btn:any):void{
      
        let ind = btn.index;

        switch(ind){
            case 1:
                this.showCardsView();
                break;
            case 2:
                this.showTextView();
                break;
            case 3:
                this.showFireView();
                break;
        }
    }

    private showCardsView():void{
        TweenLite.to(this.menuContainer, 0.5, {x:-500, alpha:0, ease:"Linear.easeOut",onComplete:() => {
        this.cardContainer.visible = true;
        this.backBtn.visible = true;
        TweenLite.from(this.cardContainer, 0.5, {alpha:0, ease:"Linear.easeOut"});
        (this.cardContainer as any).start();
        }});
    }

    private showTextView():void{
        TweenLite.to(this.menuContainer, 0.5, {x:-500, alpha:0, ease:"Linear.easeOut",onComplete:() => {
        this.textToolContainer.visible = true;
        this.backBtn.visible = true;
        TweenLite.from(this.textToolContainer, 0.5, {alpha:0, ease:"Linear.easeOut"});
        (this.textToolContainer as any).start();
        }});
    }

    private showFireView():void{
        TweenLite.to(this.menuContainer, 0.5, {x:-500, alpha:0, ease:"Linear.easeOut",onComplete:() => {
        this.fireEffectContainer.visible = true;
        this.backBtn.visible = true;
        TweenLite.from(this.fireEffectContainer, 0.5, {alpha:0, ease:"Linear.easeOut"});
        (this.fireEffectContainer as any).startEmitter();
        }});
    }

    /**
     *  Getting the scale value needed to resize Background image
    */

    private getScale(itemWidth : number,itemHeight: number,givenWidth: number,givenHeight: number){
      
        let itemRatio: number = itemWidth / itemHeight;
        let containerRatio: number = givenWidth / givenHeight;
        
        if(itemRatio > 0.7) givenWidth = 960; givenHeight = 960;

        if (containerRatio > itemRatio) {
           
            return {
                height: givenHeight,
                width: containerRatio * givenWidth
            };
        }
        else {
            
            return {
                width: itemRatio*givenWidth,
                height: givenHeight
            };
        }
    }


   private getText(txt :string,size:number):PIXI.Text{

        const style:PIXI.TextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial Rounded MT',
            fontSize: size,

            fontWeight: 'bold',
            fill: '#ffffff',
            dropShadow: true,
            dropShadowColor: '#ffffff',
            dropShadowBlur: 1,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 2,
            wordWrap: true,
            wordWrapWidth: 440,
        });
    
        const text:PIXI.Text = new PIXI.Text(txt, style);
        return text;
   }

   /**
     *  Positon the Containers based on the device orientation and resolution
    */
   
    private relocateViews(): void {
        
        this.findOffsets();

       if(this.background){

            let scale = this.getScale(this.app.view.width,this.app.view.height,960,960);
            
            if( window.innerWidth > window.innerHeight){
                scale = this.getScale(this.app.view.width,this.app.view.height,960,960);
                this.background.width = scale.width;
                this.background.height = scale.height;
                 
                this.background.y = 640/2;
                this.background.x = 960/2;

            }else{
                scale = this.getScale(this.app.view.width,this.app.view.height,960,640);
                this.background.width = scale.height;
                this.background.height = scale.width;

                this.background.x = 640/2;
                this.background.y = 960/2;
            }

       }
      
       this.menuContainer.x = this.dimensions.gameWidth/2;
       this.menuContainer.y = this.dimensions.gameHeight/2;

       this.cardContainer.x = this.dimensions.gameWidth/2;
       this.cardContainer.y = this.dimensions.gameHeight/2;

       this.textToolContainer.x = this.dimensions.gameWidth/2;
       this.textToolContainer.y = this.dimensions.gameHeight/2;

       this.fireEffectContainer.x = this.dimensions.gameWidth/2;
       this.fireEffectContainer.y = this.dimensions.gameHeight/2;

       if(this.backBtn){
        this.backBtn.anchor.x = this.backBtn.anchor.x = 0.5;
        this.backBtn.x = this.dimensions.gameWidth/2;
        this.backBtn.y = 50;

        if( window.innerWidth > window.innerHeight){
            this.backBtn.anchor.x = this.backBtn.anchor.x = 1;
            this.backBtn.x = this.dimensions.gameWidth * 0.95 ;
        }

        }
    }
}
