import { Block } from "payload";

export const HeroBlock : Block = {
  slug : "Hero",
  labels : {
    singular : "hero",
    plural : "heroes",
  },
  fields : [
    {
      type:"group",
      label:"Content",
      name:"content",
      fields:[
        {
          type:"text",
          label:"Heading",
          name:"heading",
          admin: {
            placeholder: "Enter the main heading of your hero block..."
          }
        },
        {
          type:"text",
          label:"Subheading",
          name:"subheading",
          admin: {
            placeholder: "Enter a brief subheading description..."
          }
        }
      ]
    },{
      type:"group",
      label:"Images",
      name:"image",
      fields:[
        {
          type:"upload",
          relationTo:"media",
          name:"image",
          label:"image",
        },
        {
          type:"select",
          label:"Background",
          name:"bg",
          defaultValue:"color",
          options:[
            {
              label:"Image",
              value:"image"
            },
            {
              label:"Color",
              value:"color"
            }
          ]
        },
        {
          type:'text',
          name:'bg_color',
          label:'Background Color (Hex, RGB, HSL)',
          admin:{
            placeholder: "e.g. bg-indigo-900, #1e1b4b, rgb(30, 27, 75)",
            condition: (data, siblingData) => {
              console.log("test    ", siblingData);
              return siblingData?.bg === "color";
            },
          }
        },
        
        {
          type:'upload',
          relationTo:'media',
          name:'bg_image',
          label:'Background Image',
          admin:{
            condition: (data, siblingData) => siblingData?.bg === "image",
          }
        },{
          type:"checkbox",
          label:"overlay",
          name:"overlay",
          defaultValue:false,
          admin:{
            condition: (data, siblingData) => siblingData?.bg === "image",
          }
          
        },
        {
          type:"row",
          fields:[{
            type:"text",
            label:"overlay color (Hex, RGB, HSL)",
            name:"overlay_color",
            admin:{
              placeholder: "e.g. #000000, rgba(0, 0, 0, 0.4)",
              condition: (data, siblingData) => siblingData?.overlay === true,
            }
          },
            {
            type:"number",
            label:"overlay opacity (0 to 1)",
            name:"overlay_opacity",
            min:0,
            max:1,
            admin:{
              placeholder: "e.g. 0.5",
              condition: (data, siblingData) => siblingData?.overlay === true,
            }
          }

        ]
        }
      ]
    }
  ]
    
}
