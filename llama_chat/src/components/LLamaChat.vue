<template>
  <div id="app" :style="containerStyle">
    <button class="copy-btn" @click="copyAndWriteToClipboard(`进入`)">Copy</button>
    <div class="message-content"  v-html="cachetest"></div>
    <div class="message-list" ref="messageList">
      <div v-for="(msg, index) in messages" :key="msg.content" class="message-item" :class="{'user-message': msg.sender == 'user', 'ai-message': msg.sender == 'ai'}">
     
        <div class="message-content">
        
          <div  :ref="index" v-html="msg.content"></div>
          <div class="right-tokens-text" v-if="msg.sender == 'ai' " :ref="index"> 平均token/s {{ (parseFloat( msg.mean_tokens)).toFixed(1) }},总耗时{{ (parseFloat( msg.sum_tokens)).toFixed(1) }}</div>
        </div>
      </div>
    </div>
    <div class="input-background " >
      <textarea v-model="newMessage" placeholder="请输入消息..." @focus="onFocus" class="input-field "></textarea>
      <button  @click="sendMessage"  class="nor-button send-button" v-if="!sending">发送</button>
      <button  @click="sendMessage_wait"  class="nor-button send-button" style="opacity : 0.5" v-else>发送</button>
    </div>
  </div>
</template>

<script>
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
      cachetest:""
  
    };
  },
  computed: {
    containerStyle() {

     
      return {
        backgroundColor: '#f6f6f6',
        width: '100vw', // 注意这里从 upx 转换为 px
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        renderer : null,
        marked_options : null,

      };
    },
  },
  created() {
    const markdownContent ='当然可以！以下是一个简单的 Python 代码示例，展示如何绘制一个简单的波形图：\n\n```python\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# 定义时间数组和对应的幅度数组\ntime = np.linspace(0, 10, 100)\namplitude = np.sin(time)\n\n# 创建图形\nplt.plot(time, amplitude)\n\n# 设置标题和轴标签\nplt.title(\'Simple Waveform\')\nplt.xlabel(\'Time (s)\')\nplt.ylabel(\'Amplitude\')\n\n# 显示图形\nplt.show()\n```\n\n在这个示例中，我们首先导入了`numpy`模块，并定义了时间数组和对应的幅度数组。然后，我们使用`plt.plot()`函数创建了一个简单的波形图，并设置了标题和轴标签。最后，我们使用`plt.show()`函数显示图形。\n\n你可以根据需要修改时间和幅度数据，以绘制不同的波形图。\n这是一个包含数学公式的Markdown文本：\n$$ E = mc^2 $$\n尝试使用MathJax渲染它。'
    const renderer = new marked.Renderer();
    
  const renderMath = (str, displayMode) => {
    try {
      return katex.renderToString(str, { displayMode });
    } catch (err) {
      console.warn(`KaTeX rendering error: ${err}`);
      return err.toString();
    }
  };

    // 自定义代码块渲染
    renderer.code = (code, language) => {
      return `<div class="code-block"><span class="language-label">${code.lang}</span><button class="copy-btn" data-clipboard-text="${encodeURIComponent(code.text)}">Copy</button><pre><code class="language-${code.lang}">${code.text}</code></pre></div>`;
    };

    // renderer.codespan = function(code) {
    //   console.log(code)
    //   if (code.startsWith('$') && code.endsWith('$')) {
    //     return renderMath(code.slice(1, -1), false);
    //   }
    //   return `<code>${code}</code>`;
    // };
    const originalInlineParagraph = renderer.paragraph;
    renderer.paragraph = function(text) {
      text= text.text
      if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
        console.log("识别到公式",text.trim().slice(2, -2))
        return renderMath(text.trim().slice(2, -2), true);
      }
      return originalInlineParagraph.apply(this, arguments);
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

    this.$data.cachetest = marked(markdownContent,options)

    this.replace_message()

 

  },
  mounted() {
    new ClipboardJS('.copy-btn');
    // const clipboard = new ClipboardJS('.copy-btn');

    // clipboard.on('success', function(e) {
    //   console.info('Action:', e.action);
    //   console.info('Text:', e.text);
    //   console.info('Trigger:', e.trigger);
    //   e.clearSelection();
    // });

    // clipboard.on('error', function(e) {
    //   console.error('Action:', e.action);
    //   console.error('Trigger:', e.trigger);
    // });
  },

  methods: {
    handleClick() {
      console.log('按钮被点击了！');
    },
    copyAndWriteToClipboard(text) {
      navigator.clipboard.writeText(text);
      alert(`代码复制成功`);
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
        // // 模拟AI回复
        // setTimeout(() => {
        //   this.messages.push({ sender: 'ai', content: '这是AI的回复' });
        //   this.scrollToBottom();
        //   this.$data.sending = false
        // }, 1000);
      }
    },

    async speak(context) {
      try {
        // var url = "http://192.168.10.191:5090"
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
        
          if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
            console.log("识别到公式",text.trim().slice(2, -2))
            return renderMath(text.trim().slice(2, -2), true);
          }

          var rtext = `<div class="code-block"><span class="language-label">${code.lang}</span><button class="copy-btn" data-clipboard-text="${text}">Copy</button><pre><code class="language-${code.lang}">${text}</code></pre></div>`;
          return  rtext
        };
    

              // 自定义段落处理以支持行内和块级数学公式
        this.$data.renderer.paragraph = (text) => {
          text = text.text
          console.log(text)
          // 行内公式替换
          text = text.replace(/$\s*(.*?)\s*$/g, (match, p1) => {
            try {
              return katex.renderToString(p1, { throwOnError: false });
            } catch (err) {
              console.error('Failed to render inline math:', err);
              return `<span style="color:red;">${match}</span>`;
            }
          });

          // 块级公式替换
          text = text.replace(/$\s*(.*?)\s*$/g, (match, p1) => {
            try {
              return `<p>${katex.renderToString(p1, { throwOnError: false, displayMode: true })}</p>`;
            } catch (err) {
              console.error('Failed to render block math:', err);
              return `<p><span style="color:red;">${match}</span></p>`;
            }
          });

          return `<p>${text}</p>`;
        };
        
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

        // var url = "http://192.168.10.191:5090"
        var url = "http://localhost:8080"
        const response = await axios.post(url+'/getLastStr', {
        }, {
          params: {
          }
        });
        this.$data.messages[ this.messages.length-1].content = this.getMarkedText(response.data.data.context)
        this.$data.messages[ this.messages.length-1].mean_tokens = response.data.data.mean_tokens
        this.$data.messages[ this.messages.length-1].sum_tokens = response.data.data.sum_tokens
        // Vue.set(this.list[index], 'context', newValue);
        // this.$vue.set(, 'content', response.data.data.context);
        
        this.$data.stopPolling = response.data.data.status == 4||response.data.data.status == 1
        
        this.$data.sending = true
      } catch (error) {
        this.$data.stopPolling = true;
        console.error("Error posting data:", error);
      }
    },
    async replace_message(){
      try {

        // var url = "http://192.168.10.191:5090"
        var url = "http://localhost:8080"
        const response = await axios.post(url+'/getMessageList', {
        }, {
          params: {
          }
        });

        let cache = []
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
      
      } catch (error) {
        console.error("Error posting data:", error);
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
        }, 250); // 每隔500ms执行一次
      }
    },
    
    onFocus() {
      // 页面顶起逻辑可以根据需要在此处实现
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const messageList = this.$refs.messageList;
        messageList.scrollTop = messageList.scrollHeight;
      });
    },



  
};
</script>

<style scoped>
.message-list {
  flex-grow: 1;
  overflow-y: auto;
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
  background-color: white;
  border-radius: 10px;
  color: #333;
  padding: 10px;
  max-width: 80%;
  word-wrap: break-word;
  text-align: left;
  margin-top: 15px; /* 添加顶部间距 */
}

textarea {
  flex-grow: 1;
  padding: 10px;
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
  background-color: #000;
  border-radius: 10px;
  padding: 10px;
  margin: 10px 0;
  overflow-x: auto;
  color: #fff;
}

.language-label {
  position: absolute;
  top: 5px;
  left: 10px;
  font-size: 0.8em;
  color: #ccc;
}

.copy-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background-color: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
}

.copy-btn:hover {
  color: #fff;
}

.right-tokens-text {
    font-size: 13px;
    color: #333;
    text-align: right;
    padding-right: 15px;
}
</style>