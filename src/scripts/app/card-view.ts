/**
 * Sprite class with a rotation velocity.
 */


 import {TimelineLite} from "gsap";
 import {
   
    PixiAppWrapper as Wrapper,
    
} from "pixi-app-wrapper";

export class cardView extends PIXI.Container {
    private currentCardCount:number = 0;
    private dropCount:number = 0;
    private gap:number = 3;
    private cardSpeed:number = 100;
    private animationSpeed:number = 0.2; // seconds
    private totalCards:number = 144;
    private tweenInterval:any;
    private deckArr :Array<PIXI.Sprite> = [];
    private sheet: any;
    private app: Wrapper;
    private retryBtn:PIXI.Sprite;

    private currentTween:TimelineLite ;
    private tweenArr :Array<TimelineLite> = [];
    constructor(sheet:any,app:Wrapper) {
        
        super();
        this.app = app;
        this.sheet = sheet;
        this.init();
    }

    private init():void{
        let startY:number = -320;
        for(let i : number = 0; i < this.totalCards; i++){
            const card :any   = new PIXI.Sprite(this.sheet.textures["card"]);
            card.anchor.x = card.anchor.y = 0.5;
            card.index = i;
            card.value = i;
            card.x =  -card.width/2 - 100;
            card.side = "left";
            let text = this.getText((i+1).toString(),60);
            card.addChild(text);
            card.y = startY + card.height/2;
            startY += this.gap;
            this.deckArr.push(card);
            this.addChild(card);
        }
       this.currentCardCount = this.deckArr.length;
    
       document.addEventListener("visibilitychange", this.onVisibilityChanged.bind(this), false);
       document.addEventListener("mozvisibilitychange", this.onVisibilityChanged.bind(this), false);
       document.addEventListener("webkitvisibilitychange", this.onVisibilityChanged.bind(this), false);
       document.addEventListener("msvisibilitychange", this.onVisibilityChanged.bind(this), false);

       this.retryBtn = new PIXI.Sprite(this.sheet.textures["restart"]);
       this.retryBtn.anchor.x = this.retryBtn.anchor.y = 0.5;
       this.retryBtn.scale.x = this.retryBtn.scale.y = 0.5;
       this.retryBtn.x = 0;
       this.retryBtn.y = 0;
       this.retryBtn.visible = false;
       this.retryBtn.interactive = true;
       this.retryBtn.buttonMode = true;

       this.retryBtn.on('pointerdown', this.onReStack.bind(this,this.retryBtn));

       this.addChild(this.retryBtn);
    }

    private start():void{
        this.retryBtn.visible = false;
        this.timeout();
    }

    private onReStack(btn:PIXI.Sprite):void{
        this.dropCount = 0;
        this.deckArr.reverse();
        btn.visible = false;
        this.currentCardCount = this.deckArr.length;
        this.timeout();
    }

    private tweenCard():void{
        let startY:number = -320;
        this.currentCardCount--;
        
        let spr:any = this.deckArr[this.currentCardCount];
        spr.index = ((this.totalCards-1) - spr.index);
        
        let tween:TimelineLite = new TimelineLite();
        
        this.tweenArr.push(tween);

        let xpos:number = 150;

        if(spr.side == "right") xpos = -150;

        tween.to(spr, this.animationSpeed, {x:xpos,y: startY + (spr.index * this.gap + spr.height/2) , ease:"Linear.easeOut", onStart:() => {
            spr.side = (spr.side == "left") ? "right" : "left";
            this.addChild(spr);
            
        },onComplete:() => {
            this.dropCount++;
            if(this.dropCount == this.totalCards) this.showReset();
        }});
        
    }

    private getText(txt :string,size:number):PIXI.Text{
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial Rounded MT',
            fontSize: size,
    
            fontWeight: 'bold',
            fill: '#333333',
           
        });
        
            const text:PIXI.Text = new PIXI.Text(txt, style);
            text.x -= text.width/2;
            text.y -= text.height/2;
            return text;
       }

    private timeout():void{
       
        this.tweenInterval = setTimeout(() => {
           
            this.tweenCard();
            if(this.currentCardCount > 0)
            this.timeout();
           
        }, this.cardSpeed);
    }

    private showReset():void{
        this.tweenArr = [];
        this.retryBtn.visible = true;
        
    }

    private reset():void{
        clearTimeout(this.tweenInterval);
        
        let startY:number = -320;
        this.deckArr.sort((a:any, b:any) => (a.value > b.value) ? 1 : -1);
        
        for(let i : number = 0; i < this.tweenArr.length; i++){
            if(this.tweenArr[i].isActive)this.tweenArr[i].kill();
        }
        this.currentCardCount = this.deckArr.length;
        this.tweenArr = [];
        
        for(let i : number = 0; i < this.deckArr.length; i++){
            (this.deckArr[i] as any).side = "left";
            this.deckArr[i].x = -150;
            (this.deckArr[i] as any).index = i;
            this.deckArr[i].y = startY + this.deckArr[i].height/2;
            startY += this.gap;
            this.addChild(this.deckArr[i]);
        }
        this.retryBtn.visible = false;
    }

    private onVisibilityChanged():void{
        
        let documents:any = document;

        if (documents.hidden || documents.mozHidden || documents.webkitHidden || documents.msHidden) {
            clearTimeout(this.tweenInterval)
          } else {
            clearTimeout(this.tweenInterval);
            if(this.visible && this.currentCardCount)
            this.timeout();
          }
    }
    
   

    
}


