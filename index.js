let mongodb = require('mongodb')
var express = require('express');
var app = express();
let fs = require('fs')
app.use(express.static('public'));
app.use('/images/:id',(req,res)=>{
res.end(fs.readFileSync('./images/'+req.params.id))
});
if(!fs.existsSync('./db.json')){
  let list = fs.readdirSync('./images')
    list = list.map(src=>{
        return {src:'/images/'+src}
    })
  fs.writeFileSync('./db.json', JSON.stringify(list))
}
app.use('/update',(req,res)=>{
  let data = new Buffer('')
  req.on('data',(d)=>{
    data= Buffer.concat([data,d])
  })
  req.on('end',()=>{
    let obj = JSON.parse(data.toString());

    let list =  JSON.parse(fs.readFileSync('./db.json').toString())
    let i=list.findIndex(v=>v.src===obj.src)
    if(i>-1){
      list[i]=obj
    }
    fs.writeFileSync('./db.json', JSON.stringify(list))
    res.end()
  })

})
app.use('/list',(req,res)=>{
    
    res.end(fs.readFileSync('./db.json'))
})
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
console.log(mongodb);