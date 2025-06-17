// fix-indexes.js - Save this in your backend directory
const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zanara');
    console.log('Connected to MongoDB');

    // Get the connections collection
    const db = mongoose.connection.db;
    const collection = db.collection('connections');

    // List current indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.name);
    });

    // Drop the problematic old index
    try {
      await collection.dropIndex('requester_1_recipient_1');
      console.log('✅ Dropped old requester_1_recipient_1 index');
    } catch (error) {
      console.log('ℹ️  Old index not found (this is fine)');
    }

    // Drop any other old indexes that might conflict
    const oldIndexNames = [
      'requester_1_recipient_1',
      'requestor_1_recipient_1', 
      'requester_1',
      'recipient_1'
    ];

    for (const indexName of oldIndexNames) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped old index: ${indexName}`);
      } catch (error) {
        // Index doesn't exist, which is fine
      }
    }

    // Create the correct index
    await collection.createIndex(
      { sender: 1, receiver: 1 }, 
      { unique: true, name: 'sender_1_receiver_1' }
    );
    console.log('✅ Created new sender_1_receiver_1 index');

    // Create additional helpful indexes
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ senderType: 1, receiverType: 1 });
    console.log('✅ Created additional indexes');

    // List indexes after fix
    console.log('\nIndexes after fix:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.name);
    });

    console.log('\n🎉 Database indexes fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixIndexes();