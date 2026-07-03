import HeroBlockComponent from "./hero/component"
import React from "react"

const allBlocks: any = {
  Hero: HeroBlockComponent,

}

export const RenderBlocks=({blocks}:any)=>{
    return <React.Fragment>
        {blocks.map((block:any)=>{
            const Component = allBlocks[block.blockType];
            return Component ? <Component {...block} /> : null;
        })}
    </React.Fragment>
}