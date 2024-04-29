//     const fs = require('fs');

//     class Data {
//         static instance = null;
//         solutions = [];
//         validWords = [];
//         meaningWords = [];

//         constructor() {
//             this.loadData();
//         }

//         async loadData() {
//             try {
//                 const solutionsText = await this.readFile("./src/public/data/input.txt");
//                 this.solutions = solutionsText.split("\n").map(word => word.toLowerCase().trim());

//                 const validWordsText = await this.readFile("./src/public/data/official_wordle_all.txt");
//                 this.validWords = validWordsText.split("\n").map(word => word.toLowerCase().trim());

//                 const meaningWordsText = await this.readFile("./src/public/data/output.txt");
//                 this.meaningWords = meaningWordsText.split("\n").map(word => word.toLowerCase().trim());
//             } catch (error) {
//                 console.error("Error loading data:", error);
//             }
//         }

//         async readFile(filePath) {
//             return new Promise((resolve, reject) => {
//                 fs.readFile(filePath, 'utf8', (err, data) => {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(data);
//                     }
//                 });
//             });
//         }
//     }

// export default Data;
class Data {
    static instance = null;
    solutions = [];
    validWords = [];
    meaningWords = [];
    
    constructor() {
            this.loadData();
    }

    async loadData() {
        try {
            const solutionsText = await this.loadTextFile("../data/input.txt");
            this.solutions = solutionsText.split("\n").map(word => word.toLowerCase().trim());

            const validWordsText = await this.loadTextFile("../data/official_wordle_all.txt");
            this.validWords = validWordsText.split("\n").map(word => word.toLowerCase().trim());

            const meaningWordsText = await this.loadTextFile("../data/output.txt");
            this.meaningWords = meaningWordsText.split("\n").map(word => word.toLowerCase().trim());
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    // async fetchTextFile(filePath) {
    //     try {
    //         const response = await fetch(filePath);
    //         if (!response.ok) {
    //             throw new Error(`Error fetching file: ${response.statusText}`);
    //         }
    //         return await response.text();
    //     } catch (error) {
    //         throw new Error(`Error fetching file: ${error}`);
    //     }
    // }

    async loadTextFile(filePath) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`Error loading file: ${filePath}`));
                }
            };
            xhr.onerror = function() {
                reject(new Error(`Network error while loading file: ${filePath}`));
            };
            xhr.open("GET", filePath, true);
            xhr.send();
        });
    }
}
export default Data;