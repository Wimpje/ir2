const lirc = require('lirc-client')({
  path: '/var/run/lirc/lircd'
});

const express = require('express')
const app = express()
const port = 3210
let connected = false
let messages = []

lirc.on('connect', () => {
    lirc.send('VERSION').then(res => {
        const msg = `LIRC version ${res}`
        console.log(msg);
        messages.push(`${msg}`)
    });
   connected = true;
});

lirc.on('receive', function (remote, button, repeat) {
   let m = `piped ${button}, received ${repeat}x`;
   console.log(m);
   messages.push(m)
   lirc.sendOnce(remote, button, 1);
});

app.get('/', (req, res) => res.json({title: "Infrared server", messages:messages}))
app.get('/commands', (req, res) => {
   return lirc.list("YAMAHA-RAV294").then(text => {
      console.log(text)
      res.json({title: "Infrared server", "Commands": text})
   }).catch((err) => {
      res.json({error:err})
      console.log(err)
   })
})

app.listen(port, () => console.log(`IR service listening on port ${port}!`))

app.post('/power', function (req, res) {
  res.send('Send Power Command')
  messages.push('Sent power command')
  lirc.sendOnce("YAMAHA-RAV294", "KEY_POWER")
})
// for debugging
app.get('/key/:cmd', function (req, res) {
  let cmd = req.params.cmd
  messages.push('Sent '+cmd+' command')
  lirc.sendOnce("YAMAHA-RAV294", cmd)
  res.json({title: 'Send  Command ', cmd:cmd, messages:'Sent command', method:'GET'})
})

app.post('/key/:cmd', function (req, res) {
  let cmd = req.params.cmd
  messages.push('Sent '+cmd+' command')
  lirc.sendOnce("YAMAHA-RAV294", cmd)
  res.json({title: 'Send  Command ', cmd:cmd, messages:'Sent command', method:'POST'})
})
