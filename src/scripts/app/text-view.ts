/**
 * Sprite class with a rotation velocity.
 */


import {TimelineLite} from "gsap";
 import {
   
    PixiAppWrapper as Wrapper,
    
} from "pixi-app-wrapper";

/**
     * Container Class which contains the text tool
*/

export class textView extends PIXI.Container {
    private sheet: any;
    private app: Wrapper;
    private gap: number = 20;
    private tweenInterval: number = 20;
    constructor(sheet:any,app:Wrapper) {
        
        super();
        this.app = app;
        this.sheet = sheet;
        
    }

    private start():void{
        
        this.generateTypes();
    }


    // --- Generate the types randomly ---//

    private generateTypes():void{
        
        if(!this.visible) return;

        let str:string;
        let types:Array<String> = ["t","i","e"]; 

        let container:PIXI.Container = new PIXI.Container();
        this.addChild(container);

        let textSize = this.getRandomNumberinRange(20,100);
        for(let i :number = 0 ; i < 3 ; i++){

            let rno:number = this.getRandomNumberinRange(0,types.length-1);
            this.addTypes(rno,container,textSize);
        }

        this.adjustPositions(container);

        let tween:TimelineLite = new TimelineLite();
        tween.from(container, 0.2, {y: container.y - 25 ,alpha : 0, ease:"Linear.easeOut"}).to(container, 0.2, {alpha: 0, y: container.y + 100,onComplete:() => {
           
           this.generateTypes();
           container.destroy();
        }}, "+=2"); // Tween Every container with 2 min delay and destroy on complete
    }

    // --- Choose a object based on value (Text,EMoji,Image) ---//

    private addTypes(randomNo:number,holder:PIXI.Container,textSize:number):void{
        switch(randomNo){
            case 0:
                let text:PIXI.Text = this.getText(this.generateRandomText(),textSize);
                (text as any ).updateText();
                holder.addChild(text);
                break;
            case 1:
                let emoji:PIXI.Text = this.getText(this.getEmoji(),textSize);
                (emoji as any ).updateText();
                holder.addChild(emoji);
                break;
            case 2:
                let img:PIXI.Sprite = this.generateRandomImage();
                holder.addChild(img);
                break;
        }
    }

    private getText(txt :string,size:number):PIXI.Text{
        const style:PIXI.TextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial Rounded MT',
            fontSize: size,
            fontWeight: 'bold',
            fill: '#ffffff',
        });
        
        const text:PIXI.Text = new PIXI.Text(txt, style);
        (text.anchor as any) = new PIXI.Point(0, 0.5);
        return text;
    }

    // --- Adjusting positons of container childrens ---//

    private adjustPositions(holder:PIXI.Container):void{
        
        holder.children[0].x = 0;

        for(let i = 1 ; i < holder.children.length ;i++){
            
            holder.children[i].x = holder.children[i-1].x + (holder.children[i-1] as any).width + this.gap;
        }

        holder.x -=  holder.width/2;
    }

     // --- Function to get Emoji ---//

    private getEmoji():string{
        let code:string = '1f628';
        
        const emojis = require('emojis-list')
        let no:number = this.getRandomNumberinRange(0,emojis.length-1);
       
        code = emojis[no];
      
        return code;
    }
    
    // --- Function to get random text ---//
    private generateRandomText():string{
        let text :string = '';
        let letters:string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let charactersLength:number = this.getRandomNumberinRange(2,3);
       
        for ( let i : number = 0; i < charactersLength; i++ ) {
            text += letters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        return text;
    }

     // --- Function to get random image ---//
    private generateRandomImage():PIXI.Sprite{
        let imageName :string = 'icon';
        imageName += this.getRandomNumberinRange(1,5);
        
        let img:PIXI.Sprite = new PIXI.Sprite(this.sheet.textures[imageName]);
        img.anchor.x = 0;
        img.anchor.y = 0.5;
        img.x = img.y = 0;
        img.scale.x = img.scale.y = 1.5;
        return img;
    }

     // --- Function to get random number ---//
    private getRandomNumberinRange(min:number,max:number):number{
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
}


