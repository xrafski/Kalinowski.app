const mongoose = require('mongoose');

module.exports = () => {
    // Emitted when Mongoose starts making its initial connection to the MongoDB server
    mongoose.connection.on('connecting', () =>
        console.log('(1) Connecting to the database.')
    );

    // Emitted when Mongoose successfully makes its initial connection to the MongoDB server, or when Mongoose reconnects after losing connectivity.
    mongoose.connection.on('connected', () =>
        console.log('(2) Connected to the database.')
    );

    // Your app called Connection#close() to disconnect from MongoDB
    mongoose.connection.on('disconnecting', () =>
        console.log('(3) Disconnecting from the database.')
    );

    // Emitted when Mongoose lost connection to the MongoDB server. This event may be due to your code explicitly closing the connection, the database server crashing, or network connectivity issues.
    mongoose.connection.on('disconnected', () =>
        console.log('(4) Disconnected from the database.')
    );

    // Emitted after Connection#close() successfully closes the connection. If you call conn.close(), you'll get both a 'disconnected' event and a 'close' event.
    mongoose.connection.on('close', () =>
        console.log('(5) Connection closed.')
    );

    // Emitted if Mongoose lost connectivity to MongoDB and successfully reconnected. Mongoose attempts to automatically reconnect when it loses connection to the database.
    mongoose.connection.on('reconnected', () =>
        console.log('(6) Connection restored.')
    );

    // Emitted when you're connected to a standalone server and Mongoose has run out of reconnectTries. The MongoDB driver will no longer attempt to reconnect after this event is emitted. This event will never be emitted if you're connected to a replica set.
    mongoose.connection.on('reconnectFailed', () =>
        console.log('(7) Reconnection failed.')
    );

    // Emitted if an error occurs on a connection, like a parseError due to malformed data or a payload larger than 16MB.
    mongoose.connection.on('error', (err) =>
        console.log('(8) Error.', err)
    );
};