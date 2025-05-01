<template>
    <div id="richTextDisplay" class="richText">
      <div v-html="processedContent"></div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import katex from 'katex'; // 引入KaTeX库用于渲染数学公式
  import 'katex/dist/katex.min.css';
  import marked from 'marked';
  
  export default {
    name: "RichTextDisplay",
 
    data(){
       return{ 
        cacheContext : null,
        isMounted:false,
        // processedContent:""
        
       }
    },
    props:{
        context: {
        type: String,
        required: true,
        default: ''
        }
    },

    created() {
    },

    mounted() {
        this.$data.isMounted = true
        // this.processContent()
        
    },

    watch:{
        context(newValue, oldValue)  {
            if (this.$data.isMounted && newValue !== oldValue) {
                // this.processContent()
            }
        }
    },

    computed:{
        processedContent() {
            console.log(marked)
            // 创建自定义的渲染器
            // const renderer = new marked.Renderer();
            // renderer.heading = (text, level) => {
            // if (level === 3) { // 处理 ### 作为三级标题的情况
            //     return `<strong style="color: black;">${text}</strong>`;
            // }
            // return `<h${level}>${text}</h${level}>`;
            // };

            // 使用 marked 和自定义渲染器解析内容
            // return marked(this.$props.context);
            return this.$props.context;
        }
    },

    methods:{
        processContent(){

        }

    //     processContent(){
    //         let processedContent = ref('');
    //         const content = this.$props.context
    //         let formattedContent = content.replace(/\\n/g, '<br>').replace(/\\t/g, '&emsp;');
            
    //         // 处理数学公式
    //         formattedContent = formattedContent.replace(/jatlax: (.+?)\s/g, (_, formula) => {
    //         return `<span class="math-formula" style="font-style: italic;">${katex.renderToString(formula)}</span>`;
    //         });

    //         // 处理代码块
    //         formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, 
    // '<pre class="code-block"><code>$1</code></pre>');

    //         processedContent.value = formattedContent;
    //         this.$data.processedContent = processedContent
    //     }
    }

  };
  </script>
  
<style >
    .richText{
        display: flex;
        justify-content: flex-start; /* 将内容对齐到右侧 */
        /* 如果需要垂直居中，可以添加以下属性 */
        align-items:start;
        margin-left: auto; /* 自动左边距会将元素推向右边 */
        text-align:left;
    }
   pre.code {
    background-color: #f4f4f4;
    border-radius: 10px;
    padding: 10px;
    margin: 10px 0;
    overflow-x: auto;
  }
  
  .math-formula {
    color: fff;
    font-style: italic;
  }
</style>

