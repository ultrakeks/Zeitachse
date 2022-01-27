const { setDefaultResultOrder } = require('dns');

const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);
const maxPlayers = 8;
let started = []
let watchers = []

/*const  generateRandomString = (io, num) => {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1= '';
    const charactersLength = characters.length;
    for ( let i = 0; i < num; i++ ) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    while (io.sockets.adapter.rooms.get(result1) =! undefined) {
    for ( let i = 0; i < num; i++ ) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (io.sockets.adapter.rooms.get(result1) =! undefined) {
        result1.length = 0;
    }
    }
    return result1;
}*/ 

function shuffle(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
  }

io.on('connection', function (socket) {

    const  generateRandomString = ( num) => {
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result1= '';
        const charactersLength = characters.length;
        let v;
        for ( let i = 0; i < num; i++ ) {
            result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        v = io.sockets.adapter.rooms.get(result1)
        while (v) {
            
        for ( let i = 0; i < num; i++ ) {
            result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        v = io.sockets.adapter.rooms.get(result1)

        if (v) {
            result1.length = 0;
        }
        }
        return result1;
    }


    socket.on('nextTurn', (guy) => {

        io.to(guy[0]).emit('nextTurn', guy[1]);
    })

    socket.on('Turn', (g) => {
        io.to(socket.room).emit('Turn', (g))
    })

    socket.on('start', (f) => {
        io.to(socket.room).emit('start', f)
    })

    socket.on('startCard', (data2) =>   {
        let f = [data2[0], data2[2]]
        io.to(data2[1]).emit('startCard', (f))

    });

    socket.on('itsFalse', (b) => {

            //io.to(socket.room).emit('wasFalse', (b[0]))
            io.to(b[1]).emit('itsFalse')
    })

    socket.on('wasRight', (data) => {

        //io.to(socket.room).emit('wasRight', (data))
    })

    socket.on('newGame', (data) => {

        if(data[0] != '') {
            socket.NickName = data[0]
        } else {
            socket.NickName = 'Spieler 1'
        }
        let name = data[1]
        let room;
        if(data[2]) {watchers.push(socket.id)
                        socket.watcher = true;}
        if (name != '') {
            let v = io.sockets.adapter.rooms.get(name)

            if (v) {
                socket.emit('dontExist')
                return
            } else {
                room = name
            }
        } else {
            room = generateRandomString(8)
        }
        socket.join(room)
        let dat = [room, socket.id, socket.NickName, true]
        socket.emit('code', (dat))
        socket.room = room
    })

    socket.on('startNickname', (data) => {
        let players = data[0]
        let n = data[1]
        if (n < 0) {
            n = 0
            let h = [1, n]
            io.to(players[n]).emit('usernames', h)   
        }
    })

    socket.on('usernames', (data) => {
        
        let players = data[0]
        let n = data[1]
        if (n < 0) {
            let h = [1, n]
            io.to(players[0]).emit('usernames', h)   
        } else  if (n < players.length) {

        let k = [socket.NickName, n];

        io.to(players[n]).emit('usernames', k)
        
        } else {
            io.to(players[0]).emit('firstTurn')
        }
    })

    socket.on('checkingAnother', () => {
        io.to(socket.room).emit('checkingAnother')
    })



    socket.on('cardCount', (data) => {
        
        let players = data[0]
        let n = data[1]
        let cards = data[2]
        if (n < 0) {
            io.to(players[0]).emit('cardCount', n)   
        } else  if (n < players.length) {

        let r = [cards, n]
        io.to(socket.room).emit('cardHands', r)
        n++
        io.to(players[n]).emit('cardCount', n)

        }
    })

    socket.on('changeNames', (data) => {
        let k = [socket.NickName, data]

        io.to(socket.room).emit('changeNames', k)

    })

    socket.on('joinRoom', (Room) => {
        let v = io.sockets.adapter.rooms.get(Room[0])
        let b
        if(v){b = Array.from(v)}


        if (v) {

            if(b.length < maxPlayers) {

            if (started.includes(Room[0])) {
                socket.emit('dontExist')
            } else {

            socket.join(Room[0])
            socket.room = Room[0]
            let d = Array.from(v)

            if(Room[1] != '') {
                socket.NickName = Room[1]
            } else {
                socket.NickName = 'Spieler ' + d.length
            }
            
            let data = [Room[0], socket.id, socket.NickName, false]
            socket.emit('code',(data))
            socket.to(socket.room).emit('anotherPlayer', data)

            io.to(d[0]).emit('allPlayers', data)
            console.log(d[0])
            }
        } else {
            socket.emit('dontExist')
        }} else {
            socket.emit('dontExist')
        }
    })

    socket.on('allPlayers', (data) => {
        io.to(data[3]).emit('urPlayers', data)
    })


    socket.on('startGame', (players1) => {
        for (let r = 0; r < players1.length; r++) {
            io.to(players1[r]).emit('ur', (r));
        }
    })

    socket.on('loser', function() {
        socket.to(socket.room).emit('loser');
    })

    socket.on('end', (n) => {
        socket.to(socket.room).emit('end', (n));
    })



    socket.on('getPlayers', function() {
        let v = io.sockets.adapter.rooms.get(socket.room)
        if (!v) return
        let next = Array.from(v);

        for (let n = 0; n < next.length; n++) {
            if(watchers.includes(next[n])) {
                io.to(next[n]).emit('started')
                next.splice(next.indexOf(next[n]), 1)
            }
        }

        shuffle(next);


        io.to(socket.room).emit('getPlayers', next)
        io.to(socket.room).emit('newGame', next)
        io.to(socket.room).emit('start')
        socket.emit('starting')
        started.push(socket.room)
    })

    socket.on('urId', function() {
        socket.emit('urId', socket.id)
    })

    socket.on('dealCard', (data) => {
        socket.to(socket.room).emit('dealCard', (data));
    });

    socket.on('drop', (gameObject, dropZone) => {
        socket.to(socket.room).emit('drop', (gameObject, dropZone));
    })

    socket.on('next', (data) => {
        socket.to(socket.room).emit('next', (data));
    })

    socket.on('order', (data) => {
        socket.to(socket.room).emit('order', (data))
    })

    socket.on('endGame', function() {
        io.to(socket.room).emit('endGame')
        started.splice(started.indexOf(socket.room), 1)
    })

    socket.on('entbinden', function() {
        socket.disconnect(true)
    })

    socket.on('check', function() {
        socket.to(socket.room).emit('check')
    })

    socket.on('destroy', function() {
        socket.to(socket.room).emit('destroy')
    })

    socket.on('disconnect', function () {
        let v = io.sockets.adapter.rooms.get(socket.room)
        if(!v) {

            if(started.includes(socket.room)) {
                started.splice(started.indexOf(socket.room), 1)

        }}
        if(v) {
            if(!socket.watcher) {
            io.to(socket.room).emit('oneDisconnect', socket.id)
        }}
    });
});


http.listen(3000, '167.86.74.64');