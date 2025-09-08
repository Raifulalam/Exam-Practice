const mongoose = require("mongoose");

async function renameCollection() {
    await mongoose.connect("mongodb+srv://rehanmalik0769_db_user:2diGTCQ8nrpHtcJ4@cluster0.tzolcq2.mongodb.net/ExamDatabase?retryWrites=true&w=majority&appName=Cluster0");

    const db = mongoose.connection.db;

    try {
        await db.collection("examresponses").rename("gameresponses");
        console.log("Collection renamed successfully!");
        await db.collection("exams").rename("games");
        console.log("Collection renamed successfully!");
    } catch (err) {
        console.error("Error renaming:", err);
    } finally {
        await mongoose.disconnect();
    }
}

renameCollection();
