var http = require('https');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var keywordObj={};
var i = 1;
var url = "https://segmentfault.com/questions?page="; 
//初始url 

function fetchPage(x) {     //封装了一层函数
    startRequest(x); 
}


function startRequest(x) {
     //采用http模块向服务器发起一次get请求      
    http.get(x, function (res) {     
        var html = '';        //用来存储请求网页的整个html内容
        var titles = [];        
        res.setEncoding('utf-8'); //防止中文乱码
     //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
          html += chunk;
        });
     //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
         var $ = cheerio.load(html); //采用cheerio模块解析html
         $(".tag-sm").each(function(){
          var innerHTML=$(this).html();
          //可能存在中文乱码在此转化
          innerHTML=unescape(innerHTML.replace(/&#x/g,'%u').replace(/;/g,''))
            if(keywordObj.hasOwnProperty(innerHTML))
              //如果有当前属性则+1
            {
              keywordObj[innerHTML]=keywordObj[innerHTML]+1
            }else{
              //如果没有则新建
              keywordObj[innerHTML]=1;
            }
         });

         
            
            var nextLink=url+(++i); 
            
            str = encodeURI(nextLink);  

            if (i <= 40) {                
                fetchPage(str);
                console.log(i);
                console.log(keywordObj);
            }else{
              savedContent(keywordObj);
              
            }

        });

    }).on('error', function (err) {
        console.log(err);
    });

}

function savedContent(keywordObj) {
  keywordObj=JSON.stringify(keywordObj,null, 2);
      fs.writeFile('./data/' + "keywordObj" + '.json', keywordObj, 'utf-8', function (err) {
          if (err) {
              console.log(err);
          }
      });
    
}

fetchPage(url+i);      //主程序开始运行