<template>
  <div id="app"  class="containerStyle">
    <div class="message-list " @scroll="handleScroll" ref="messageList">
      <div v-for="(msg, index) in messages" :key="msg.content" class="message-item def-text" :class="{'user-message': msg.sender == 'user', 'ai-message': msg.sender == 'ai'}">
     
        <div class="message-content">
        
          <div  :ref="index" v-html="msg.content"></div>
          <div class="right-tokens-text def-text" v-if="msg.sender == 'ai' " :ref="index"> 平均token/s {{ (parseFloat( msg.mean_tokens)).toFixed(1) }},总耗时{{ (parseFloat( msg.sum_tokens)).toFixed(1) }}</div>
        </div>
      </div>
    </div>
    <div class="input-background " >
      <textarea v-model="newMessage" placeholder="请输入消息..." @focus="onFocus" class="input-field " @keydown="handleKeydown"></textarea>
      <button  @click="sendMessage"  class="nor-button send-button" v-if="!sending">发送</button>
      <button  @click="sendMessage_wait"  class="nor-button send-button" style="opacity : 0.5" v-else>发送</button>
    </div>
  </div>
</template>

<script>

import at from 'array.prototype.at';
at.shim();
import katex from 'katex';
import 'katex/dist/katex.min.css'; // 导入 KaTeX 样式
import axios from 'axios';
import { marked } from 'marked';
import hljs from 'highlight.js'
import 'highlight.js/styles/foundation.css'
import ClipboardJS from 'clipboard';
export default {
  components: {
  },



  data() {
    return {
      newMessage: '请帮我使用vue写一个helloworld',
      messages: [],
      intervalId: null,
      sending : false,
      stopPolling : false,
      cachetest:"",
      isAtBottom:true,
    };
  },
  created() {
    const markdownContent ='当然可以！以下是一个简单的 Python 代码示例，展示如何绘制一个简单的波形图：\n\n```python\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# 定义时间数组和对应的幅度数组\ntime = np.linspace(0, 10, 100)\namplitude = np.sin(time)\n\n# 创建图形\nplt.plot(time, amplitude)\n\n# 设置标题和轴标签\nplt.title(\'Simple Waveform\')\nplt.xlabel(\'Time (s)\')\nplt.ylabel(\'Amplitude\')\n\n# 显示图形\nplt.show()\n```\n\n在这个示例中，我们首先导入了`numpy`模块，并定义了时间数组和对应的幅度数组。然后，我们使用`plt.plot()`函数创建了一个简单的波形图，并设置了标题和轴标签。最后，我们使用`plt.show()`函数显示图形。\n\n你可以根据需要修改时间和幅度数据，以绘制不同的波形图。\n这是一个包含数学公式的Markdown文本：\n$$ E = mc^2 $$\n尝试使用MathJax渲染它。'
    const renderer = new marked.Renderer();
 
    this.wait_speak()
    
  const renderMath = (str, displayMode) => {
    try {
      return katex.renderToString(str, { displayMode });
    } catch (err) {
      console.warn(`KaTeX rendering error: ${err}`);
      return err.toString();
    }
  };

 

    const options = {
          gfm: true,
          breaks: true,
          smartLists: true,
          smartypants:true,
          highlight: function(code) {
            return require('highlight.js').highlightAuto(code).value;
          },
          renderer:renderer
        };

    // this.$data.cachetest = this.getMarkedText(markdownContent)

    this.replace_message()

 

  },
  mounted() {
    new ClipboardJS('.copy-btn');
    this.adjustHeight();
    window.addEventListener('resize', this.adjustHeight);
    window.addEventListener('resize', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.adjustHeight);
    window.removeEventListener('resize', this.handleScroll);
  },

  methods: {
    handleScroll() {
      const { scrollHeight, scrollTop, clientHeight } = this.$refs.messageList;
      // 判断是否滚动到底部
      this.isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
    },
    copyAndWriteToClipboard(text) {
      navigator.clipboard.writeText(text);
      alert(`代码复制成功`);
    },
    handleKeydown(event) {
      // 检查是否按下了 Ctrl 键和回车键
      if (event.ctrlKey && event.key === 'Enter') {
        // 阻止默认行为（如果有的话）
        event.preventDefault();
        // 在光标位置插入换行符
        const textarea = event.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        this.newMessage = this.newMessage.substring(0, start) + '\n' + this.newMessage.substring(end);
        // 更新光标位置
        textarea.setSelectionRange(start + 1, start + 1);
      } else if (event.key === 'Enter' && !event.ctrlKey) {
        // 阻止默认行为
        event.preventDefault();
        // 触发指定事件或逻辑
        this.sendMessage();
      }
    },
    sendMessage() {
      if (this.newMessage.trim()) {
        this.$data.sending = true
        this.$data.messages.push({ sender: 'user', content: this.newMessage });
        this.speak(this.newMessage);
        this.newMessage = '';
        this.$data.stopPolling = false

        this.$data.messages.push({ sender: 'ai', content: "",mean_tokens:0.0,sum_tokens:0.0 });
        this.wait_speak()
      }
    },

    async speak(context) {
      try {
        // var url = "http://192.168.1.57:8080"
        var url = "http://localhost:8080"
        const response = await axios.post(url+'/speek', {
        }, {
          params: {
            context: context
          }
        });
       
      } catch (error) {
        console.error("Error posting data:", error);
      }
    },


    getMarkedText(context) {
      // return context
      // console.log('查看输入',context)
      if(this.$data.tokenizer == null){
      
                
        this.$data.tokenizer  =new marked.Tokenizer()
        // 自定义 Tokenizer：识别 [公式]
        this.$data.tokenizer.math = (src) => {
          const regex_math = /\$\$(.+?)\$/g;

          const regex_inline_math = /\\\((.+?)\\\)/g;
          const regex_qwen_math = /\\\[ (.+?) \\\]/g;
          const regex_qwen_math_br = /\\\[\n(.+?)\n\\\]/g;
          var allend = true
          var rvalues = []
          var sourcesrc= src
          if(allend)
          // return false
          while(allend){
            var rvalue = {}
            const match = regex_math.exec(src);
            const inline_math = regex_inline_math.exec(src);
            const qwen_math = regex_qwen_math.exec(src);
            const qwen_math_br = regex_qwen_math_br.exec(src);
            var moveIndex = 0;
            
            if (match) {
              rvalue= {
                type: 'math',
                text: match[1],
                math_type :  "math",
              };
              moveIndex=match.index + match[0].length
            }
            else if(inline_math){

              rvalue= {
                type: 'text',
                text: src.slice(0,inline_math.index),
                math_type :  "text",
              };
              
              rvalues.push(rvalue)

              rvalue= {
                type: 'math',
                text: inline_math[1],
                math_type :  "inline",
              };
              moveIndex=inline_math.index + inline_math[0].length;
            }
            else if(qwen_math){

              rvalue= {
                type: 'math',
                text: qwen_math[1],
                math_type :  "qwen",
              };
              moveIndex=qwen_math.index + qwen_math[0].length;
            }else if(qwen_math_br){
              rvalue= {
                type: 'math',
                text: qwen_math_br[1],
                math_type :  "qwen",
              };
              moveIndex=qwen_math_br.index + qwen_math_br[0].length;
            }else {
              rvalue= {
                type: 'text',
                text: src,
              };
              allend=false
            }
            if(allend){
              src = src.slice(moveIndex,src.length)
            }
            if(rvalue.type != undefined){
              rvalues.push(rvalue)
            }


            regex_math.lastIndex = 0;
            regex_inline_math.lastIndex=0;
            regex_qwen_math.lastIndex=0;
          }
          if(rvalues.length == 0){
            // rvalues[0].raw = sourcesrc
            // return rvalues[0]
            return false
          }

          if(rvalues.length==1){
            if(rvalues[0].type == 'text'){
               return false
            }
          }

          if(rvalues.length>0){
            rvalue= {
                type: 'math',
                morelinex : true,
                texts: rvalues,
                raw:sourcesrc
              };
            return rvalue;
          }else{
            return false
          }
        };

      }


      if(this.$data.renderer == null){
        const renderMath = (str, displayMode) => {
          try {
            return katex.renderToString(str, { displayMode });
          } catch (err) {
            console.warn(`KaTeX rendering error: ${err}`);
            return err.toString();
          }
        };



        this.$data.renderer = new marked.Renderer();
        // 自定义 Renderer：返回带 $...$ 的 span 标签
        this.$data.renderer.math = (text) => {

          if(text.morelinex){
            var divtext = '<div class="math-block">'
            text.texts.forEach(item => {
               var div = ""
              if (item.type === 'text') {
                  // 使用 marked 处理普通文本
                  div = `${item.text}`
                  divtext += div
              } else {
                  // 使用 KaTeX 处理数学表达式
                 
                  try {
                    div = renderMath(item.text.trim(), item.math_type!='inline')
                  } catch (e) {
                      div = '无法渲染的数学表达式';
                  }
                  divtext += div
                  // container.appendChild(div);
              }
            });
            divtext += '</div>'
            return divtext
          }else{
            text= text.text
            return renderMath(text.trim(), true);
          }
          
        };

    
        // 注册扩展
        // 自定义代码块渲染
        this.$data.renderer.code = (code, language) => {
          let text = code.text
          if(code.lang == "html" || code.lang == "vue" ){
            text=text.replace(/&/g, '&amp;')
                         .replace(/</g, '&lt;')
                         .replace(/>/g, '&gt;')
                         .replace(/"/g, '&quot;')
                         .replace(/'/g, '&#039;');
          }
        
     
          var rtext = `<div class="code-block"><span class="language-label">${code.lang}</span><button class="copy-btn" data-clipboard-text="${text}">Copy</button><pre class="code-pre"><code class="language-${code.lang}">${text}</code></pre></div>`;
          return  rtext
        };
        marked.use({
          extensions: [
            {
              name: 'math',
              level: 'inline', // 或 'block'
              start(src) { return src.match(/\$/g)?.length >= 2 ? 0 : -1; },
              tokenizer: this.$data.tokenizer.math,
              renderer: this.$data.renderer.math
            }
          ]
        });
      }


      
      if(this.$data.marked_options == null){
        
        this.$data.marked_options = {
              gfm: true,
              breaks: true,
              smartLists: true,
              smartypants:true,
              highlight: function(code) {
                return require('highlight.js').highlightAuto(code).value;
              },
              renderer:this.$data.renderer
            };
            
      }
      context = marked(context,this.$data.marked_options)
      return context
    },

    async checklaststr() {
      try {

        //var url = "http://192.168.1.57:8080"
        var url = "http://localhost:8080"
        const response = await axios.post(url+'/getLastStr', {
        }, {
          params: {
          }
        });
        
        var data = response.data.data
        if(data == undefined){

          console.warn("data was undefined")
        }else{
          this.$data.messages[ this.messages.length-1].content = this.getMarkedText(data.context)
          this.$data.messages[ this.messages.length-1].mean_tokens = data.mean_tokens
          this.$data.messages[ this.messages.length-1].sum_tokens = data.sum_tokens
          // Vue.set(this.list[index], 'context', newValue);
          // this.$vue.set(, 'content', response.data.data.context);
          
          this.$data.stopPolling = data.status == 4||data.status == 1
          this.scrollToBottom()
        }
        this.$data.sending = true
      } catch (error) {
        this.$data.stopPolling = true;
        console.error("Error posting data:", error);
      }
    },
    async replace_message(){
      try {

         //var url = "http://192.168.1.57:8080"
        var url = "http://localhost:8080"
        const response = await axios.post(url+'/getMessageList', {
        }, {
          params: {
          }
        });

        let cache = []
        console.log("输出结果检查",response.data.data.length,response.data.data)
        for (let i = 0;i<response.data.data.length;i++){
          if(response.data.data[i].role == 'user'){

            cache.push({
              sender: 'user',
              content:response.data.data[i].content
            })
          }else{
            cache.push({
              content:this.getMarkedText(response.data.data[i].content),
              sender: 'ai',
              mean_tokens:response.data.data[i].mean_tokens,
              sum_tokens:response.data.data[i].sum_tokens
            })
          }
        }

        this.$data.messages = cache
        console.log("查看高度",document.documentElement.scrollHeight)
        this.checkPageHeight()
      } catch (error) {
        console.error("Error posting data:", error);
      }
    },
    checkPageHeight() {
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight, 
        document.body.scrollHeight
      );
      const viewportHeight = window.innerHeight;

      console.log(`整个页面的高度: ${scrollHeight}px`);
      console.log(`视口高度: ${viewportHeight}px`);

      if (scrollHeight > viewportHeight) {
        console.log('由于页面内容超出了视口高度，出现了滚动条。');
      } else {
        console.log('页面内容没有超出视口高度，没有滚动条。');
      }
    },

    wait_speak() {
        this.intervalId = setInterval(() => {
          if (!this.$data.stopPolling) {
            this.checklaststr();
          } else {
            clearInterval(this.intervalId); // 清除定时器，停止轮询
            
            this.$data.sending = false
          }
        }, 300); // 每隔500ms执行一次
      },

      adjustHeight() {
        const vh = window.innerHeight * window.devicePixelRatio ;
        console.log("vh",vh)
        this.$refs.messageList.style.height = `${1 * vh - 150}px`;
      },
      scrollToBottom() {
        if (this.isAtBottom) {
          this.$nextTick(() => {
            this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
          });
        }
      },
    },

    
    onFocus() {
      // 页面顶起逻辑可以根据需要在此处实现
    },



  
};
</script>

<style>


.message-list {
  flex-grow: 1;
  overflow-y: auto;
  height: 80vh; 
  border: 1px solid #ccc; /* 可选：增加边框以便更清晰地看到滚动区域 */
  margin-top: 20px;
  margin-bottom: 20px;
  margin-right: 15px;
  margin-left: 15px;
  background-color: #f4f4f4;
}

.message-item{
  margin-left: 15px;
  margin-right: 15px;
  font-size: 1.3rem;
}
.message-item.user-message .message-content,
.message-item.ai-message .message-content {
  margin-bottom: 15px; /* 添加底部间距 */
}
.message-item.user-message .message-content {
  background-color: #e0f7ff;
  border: 1px solid #bce8f1;
  color: #333;
  padding: 10px;
  border-radius: 4px;
  max-width: 80%;
  word-wrap: break-word;
  text-align: left;
  margin-left: auto;
  margin-top: 15px; /* 添加顶部间距 */
}
.message-item.ai-message .message-content {
  background-color: #fff;
  border-radius: 10px;
  color: #333;
  padding: 10px;
  max-width: 80%;
  word-wrap: break-word;
  text-align: left;
  margin-top: 15px; /* 添加顶部间距 */
}

.textarea {
  flex-grow: 1;
  padding: 10px;
  resize:none;

  margin-right: 15px; /* 添加右边距 */
}
.send-button {
  width: 100px;
  height: 50px;
  border-radius: 25px;
}


pre.code {
    background-color: #f4f4f4;
    border-radius: 10px;
    padding: 10px;
    margin: 10px 0;
    overflow-x: auto;
  }



  /* 自定义代码块的样式 */
.code-block {
  position: relative;
  background-color: #333;
  border-radius: 10px;
  padding: 10px;
  margin: 10px 0;
  overflow-x: auto;
  color: #fff;
  
}
.code-pre{
  margin-bottom: 10px;
  margin-top: 25px;
  padding-left: 10px;
  padding-right: 10px;
}
.language-label {
  position: absolute;
  top: 10px;
  left: 20px;
  font-size: 0.8em;
  color: #ccc;
}

button.copy-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  background-color: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
}

button.copy-btn:hover {
  color: #fff;
}

.right-tokens-text {
    font-size: 1.2rem;
    color: #333;
    text-align: right;
    padding-right: 15px;
}
.containerStyle{
  padding-top: 15px;
  overflow: hidden; /* 禁止整个应用的滚动 */
  background-color: '#f6f6f6';
  width: '100%';
  height: '100%';
  display: 'flex';
  flex-direction: 'column';
}
</style>