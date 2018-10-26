const data = {
    currentNote: {
        note: {},
        noteId: null
    },
    notes: [],
    noteId: 0,

    // Get notes from localStorage
    getNotes: function(){
        return JSON.parse(localStorage.notes);
    },

    // update notes in localStorage
    updateStorage: function(){
        localStorage.notes = JSON.stringify(this.notes);
    },

    // Initialize data object
    init: function(){
        // Create new storage for notes if there is none
        if (!localStorage.notes){
            localStorage.notes = JSON.stringify(this.notes);
        }

        // If storage exists,
        // get notes and store them in data notes object
        else { 
            let notes = this.getNotes();
            for (note of notes){
                this.notes.push(note);
            }
            this.noteId = this.notes.length;
        }
    }
}


// View model
const model = {
    unsavedNewNote: false,
    isNewNote: false,
    init: function(){
        // view.hideTableBanner();
        data.init();
        view.init();
    },
    getFormattedDate(){
        const d = new Date();
        const month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        return d.getDate()+' '+month[d.getMonth()]+', '+d.getFullYear();
    },
    // Get existing notes
    getNotes: function(){
        return data.notes;
    },

    // Save a note
    saveNote: function(note){
        // Get the current note
        let currentNote = this.getCurrentNote();

        // If a new note is being created
        // Add the note to the notes list (data.notes) 
        // And increase note count
        if (this.isNewNote){
            
            
            data.notes.push(note);
           
            let noteList = view.getNoteList();
            
            view.selectNote(noteList[0]);
            view.selected = noteList[0];
            
            this.increaseNoteCount();
        }

        // Find the existing note, using the noteId
        // And re-render the saved Notes list 
        else {
    
            data.notes[currentNote.noteId].snippet = note.snippet;
            data.notes[currentNote.noteId].noteContent = note.noteContent;
            data.notes[currentNote.noteId].date = note.date;
            view.deselectNote(view.selected);
            view.selectNote(view.selected);
        }
        view.editNote(view.selected, note);
        view.selected.classList.add('save-item');
        // Update storage with new changes
        data.updateStorage(); 
        view.enableButton([newNoteButton])
        this.isNewNote = false;
        this.unsavedNewNote = false;
    },

    // create a new note
    createNote: function(){
        this.isNewNote = true;
        this.unsavedNewNote = true;
        let note = {
            snippet: {
                heading: "New note", 
                subHeading: ""
            },
            noteContent: "",
            date: this.getDate()
        };
        this.setCurrentNote(note, data.noteId);
        let scrollOffset = -document.querySelector('#sidebar').scrollTop;
        document.querySelector('#sidebar').scrollBy(0, scrollOffset);
        view.appendNote(note, data.noteId);
        
        let noteList = view.getNoteList();
        view.selectNote(noteList[0]);
        // this.setCurrentNote({}, null);
        view.clearContentArea();
        view.enableButton([deleteButton]);
    },
    // set the current note
    setCurrentNote: function(note, noteId){
        data.currentNote.note = note;
        data.currentNote.noteId = noteId;
    },
    getCurrentNote: function(){
        return data.currentNote;
    },
    displayNote: function(){
        let currentNote = this.getCurrentNote();
        view.renderContent(currentNote.note.noteContent);
    },
    increaseNoteCount: function(){
        data.noteId += 1;
    },
    decreaseNoteCount: function(){
        data.noteId -= 1;
    },
    deleteNote: function(){
        let currentNote = this.getCurrentNote();
        data.notes.splice([currentNote.noteId], 1);
        this.decreaseNoteCount();
        data.updateStorage();
        view.removeNote(view.selected);
        this.setCurrentNote({}, null);
        
        this.isNewNote = true;
        view.enableButton([newNoteButton]);
    },
    getDate: function(){
        let date = new Date();
        return date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear();
        
    }
    
}

const newNoteButton = document.querySelector('#newnote');
const deleteButton = document.querySelector('#del');
const saveButton = document.querySelector('#save');
const toolbar = document.querySelector('#tools');
const docTools = document.querySelectorAll('#tools .doc-tool');
const contentArea = document.querySelector('#note article');
const today = document.querySelector('#note time');
const sideBar = document.querySelector('#sidebar ul');
// const tableButton = document.querySelector('#table .fa-table');
const listButton = document.querySelector('#list');
const hamburger = document.querySelector('#hamburger');
const close = document.querySelector('#close');
// const tableBanner = tableButton.querySelector('.dropdown');
const tableTemplate = document.querySelector('#tableTemplate');
const addRow = document.querySelector('#addRow');
const addColumn = document.querySelector('#addColumn');
const boldButton = document.querySelector('#bold');
const italicsButton = document.querySelector('#italics');
const underlineButton = document.querySelector('#underline');
const firstNoteButton = document.querySelector('.landing-page-text .new-note')
const toolLabels = document.querySelectorAll('.tool-label');

const view = {
    // 
    // INIT
    // 

    selected: '',
    currentTable: null,
    isBannerShown: false,
    tableRowCount: 2,
    rowCount: 2,
    tableCount: 0,
    init: function(){
        this.disableDocTools();

        this.disableButton([deleteButton]);

        this.renderSavedNotes();
        model.isNewNote = true;

        let date = model.getFormattedDate();
        today.innerHTML = date;

        this.initTools();
        
        if (model.getNotes().length > 0){
            view.hideLandingPage();
        }
        else {
            view.disableButton([newNoteButton]);
            
            for (toolLabel of toolLabels){
                toolLabel.classList.remove('label');
            }
        }
        
        
    },


    // 
    // TOOLBAR
    // 
    initTools(){
        this.newNoteButton();
        this.saveButton();
        this.deleteButton();
        this.contentArea();
        this.formatTools();
        // this.tableButton();
        this.firstNoteButton();
    },
    enableDocTools: function(){
        view.enableButton(docTools);
        // tableButton.classList.add('showbanner');
    },
    disableDocTools: function(){
        view.disableButton(docTools);

        // tableButton.classList.remove('showbanner');
    },
    enableButton: function(buttons){
        for (button of buttons){
            button.disabled = false;
            button.firstElementChild.classList.remove('disabled');
            button.classList.add('active');
        }
    },
    disableButton: function(buttons){
        for (button of buttons){
            button.disabled = true;
            button.classList.remove('active');
            button.firstElementChild.classList.add('disabled');
        }
    },
    saveButton: function(){
        saveButton.addEventListener('click',function(){
            if (saveButton.disabled){
                return;
            }
 
            let note = view.getNoteData();
            

            if(note === false){
                return;
            }
            view.disableDocTools(); 
            view.enableButton([deleteButton]);
            model.saveNote(note);
            
        }); 
    },
    deleteButton: function(){
        deleteButton.addEventListener('click', function(){
            if (deleteButton.disabled){
                return;
            }
            view.clearContentArea();
            view.selected.querySelector('div').classList.add('hide-item');
            view.disableButton([deleteButton]);
        })
    },
    newNoteButton: function(){
        this.enableButton([newNoteButton]);
        newNoteButton.addEventListener('click',function(){
            if (newNoteButton.disabled){
                return;
            }
            view.disableButton([newNoteButton]);
            
                contentArea.focus();
                view.enableDocTools();  
            model.isNewNote = true;
            view.deselectNote();
            model.createNote();
        });
    },
    formatDoc: function(button, command){
        button.addEventListener('mousedown', function(e){
            e.preventDefault();
        });
        button.addEventListener('click', function(){
            if (button.disabled){
                return;
            }
            document.execCommand(command,false);
        })
    },


    formatTools: function(){
        let formatTools = [
            {
                button: boldButton,
                command: 'bold',
            },
            {
                button: italicsButton,
                command: 'italic',
            },
            {
                button: underlineButton,
                command: 'underline',
            },
            {
                button: listButton,
                command: 'insertUnorderedList',
            },
        ];
        for(tool of formatTools){
            this.formatDoc(tool.button, tool.command, tool.value);
        }
    },

    tableButton: function(){
        tableButton.addEventListener('mousedown', function(e){
            e.preventDefault();
        });
       
        tableButton.addEventListener('click', function(){
            if (tableButton.disabled){
                return;
            }
            let tableHTML = view.createTable(2,3, view.tableCount).innerHTML;
            
            document.execCommand('insertHTML',false,tableHTML);

            document.querySelector('#options').style.display = 'unset';
                    let tableId = '#table'+ (view.tableCount);
                    view.increaseTableCount();
                    
                    document.querySelector(tableId).addEventListener('focus', function(){
                        document.querySelector('#options').style.display = 'unset';
                    });
                    document.querySelector(tableId).addEventListener('blur', function(){
                        console.log("hey");
                        document.querySelector('#options').style.display = 'none';
                    });
        })
    },
    hideLandingPage: function() {
        document.querySelector('#sidebar').classList.remove('empty');
        document.querySelector('nav').classList.remove('empty');
        document.querySelector('#landing-page').style.display = 'none';
        document.querySelector('#note').style.display = 'unset';
    },
    firstNoteButton: function(){
        firstNoteButton.addEventListener('click', function(){
            view.hideLandingPage();
            view.disableButton([newNoteButton]);
            for (toolLabel of toolLabels){
                toolLabel.classList.add('label');
            }
                contentArea.focus();
                view.enableDocTools();  
            model.isNewNote = true;
            view.deselectNote();
            model.createNote();
        })
    },

  
    // 
    // TOOLBAR TABLE
    // 
    increaseTableCount: function(){
        this.tableCount = this.tableCount + 1;
    },
    createTable: function(row, column, id){
        let span = document.createElement('span');
        let table = document.createElement('table');
        table.id = 'table'+ id;
        table.classList = "new-table";
        for(let i = 0; i < row; i++){
            let tr = view.createTableRow();
            for(let i = 0; i < column; i++){
                let td = view.createTableData();
                tr.append(td);
            }
            table.append(tr);
        }
        view.currentTable = table;
        span.append(table);
        return span;
    },
    createTableData: function(){
        let td = document.createElement('td');
        return td;
    },
    createTableRow: function(){
        let tr = document.createElement('tr');
        return tr;
    },

    
    // 
    // SIDEBAR
    // 

    toggleSidebar: function(){
        hamburger.addEventListener('click', function(){
            document.querySelector('#sidebar').style.transform = 'unset';
            document.querySelector('#close').style.transform = 'translateX(60vw)';
            view.disableDocTools();
        })
        close.addEventListener('click', function(){
            document.querySelector('#sidebar').style.transform = 'translateX(-100%)';
            document.querySelector('#close').style.transform = 'translateX(-60vw)';
            view.enableDocTools();

        })
    },
    createMenuElement: function(note, noteId){
        let li = document.createElement('li');
        let time = document.createElement('time');
        time.className = 'date';
        let h4 = document.createElement('h4');
        let div = document.createElement('div');
        let p = document.createElement('p');
        h4.innerHTML = note.snippet.heading;
        p.innerHTML = note.snippet.subHeading;

        time.innerHTML = note.date;

        div.append(h4,p,time);
        li.dataset.id = noteId;
        li.append(div);
        
        if (model.isNewNote){
          
            li.classList.add('add-item');
            div.classList.add('show-item');

        }
        return li;
    },
    appendNote: function(note, noteId){
        let li = this.createMenuElement(note, noteId);
        sideBar.prepend(li);

            this.openNote(li, note, noteId);

        this.afterAnimation(li);  
    },
    renderSavedNotes: function(){
        let notes = model.getNotes();
       
        if (notes.length > 0){
                for(note of notes){
                this.appendNote(note, notes.indexOf(note));
            }
        }
        this.toggleSidebar();
    },
    deselectNote: function(){
        let noteList = view.getNoteList();
        noteList.forEach(function(li){
            if(li.classList.contains('highlight'))
                li.classList.remove('highlight');
        })
    },
    selectNote: function(li){
        li.classList.add('highlight');
        this.selected = li;
    },
    removeNote: function(menuitem){
        menuitem.remove();
        this.selected = '';
    },
    getNoteList: function(){
        return document.querySelectorAll('#sidebar li');
    },
    editNote: function(li, note){
        li.querySelector('div h4').innerHTML = note.snippet.heading;
        li.querySelector('div p').innerHTML = note.snippet.subHeading;
        li.querySelector('div time').innerHTML = note.date;
        view.openNote(li, note, data.currentNote.noteId);
    },
    openNote: function(li, note, noteId){
        li.addEventListener('click', function(){
            // save any unsaved note
            if (model.unsavedNewNote){

                // let noteList = view.getNoteList();

                let unsavedNoteData = view.getNoteData();
                if(unsavedNoteData === false){
                   model.deleteNote();
                }
                else {
                    model.saveNote(unsavedNoteData);
                }
                model.unsavedNewNote = false;
            }

            model.isNewNote = false; 
            view.deselectNote();
            view.selectNote(li);
            model.setCurrentNote(note, noteId);
            model.displayNote();
            view.disableDocTools();
            view.enableButton([deleteButton]);

            // Add event listener for already extisting tables in an already saved note

            let tables = document.querySelectorAll('table');
            for (table of tables){
                table.addEventListener('focus', function(e){
                    event.target.style.background = "pink";
                    // if (this.className ==='new-table'){
                    //         console.log("in focus");
                    //         document.querySelector('#options').style.display = 'unset';
                    //     }
                    //     else{
                    //         console.log("not in focus");
                    //         document.querySelector('#options').style.display = 'none';}
                    
                    },true);
            }
        
            
        });
    },

    //         
    // CONTENT 
    // 

    clearContentArea: function(){
        contentArea.innerHTML = '';
    },
    getContent: function(){
        return contentArea.innerHTML;
    },
    renderContent: function(content){
        this.clearContentArea();
        contentArea.innerHTML = content;
    },
    getHeading: function(noteContent){
        let heading = noteContent.split('<div>')[0];
            
            if (heading.length > 15 ){
                heading = heading.substr(0, 15);
                heading += '...';
            }
        return heading;
    },
    getSubHeading: function(){
        let subHeading;

        if (contentArea.childNodes.length > 1){
           
            console.log(contentArea.firstElementChild);
            subHeading = contentArea.childNodes[1].innerText;
            
            if (subHeading.length > 0) {
            
                if (subHeading.length > 10){ 

                    subHeading = subHeading.substr(0, 10);
                    subHeading += '...';
                }
                else {
                    subHeading = subHeading;
                }
            }
        }
        else {  
            subHeading = '';
        }
    return subHeading;
    },
    getNoteData: function(){
        let noteContent = view.getContent();
            if (noteContent.length === 0){
                return false;
            }
            let heading = this.getHeading(noteContent);
            let subHeading = this.getSubHeading(noteContent);
            
            let date = model.getDate();

            let note = {
                snippet: {
                    heading: heading, 
                    subHeading: subHeading
                },
                noteContent: noteContent,
                date: date
            };
            
            return note;
    },
    contentArea: function(){
        
        contentArea.addEventListener('click',function(){
            view.enableDocTools(); 
            if (newNoteButton.disabled){
                return;
            }
            if(model.isNewNote){
                view.disableButton([newNoteButton]);
                model.createNote();
            }
                       
        });
        // contentArea.addEventListener('focus', function(e){
            
        //     if (e.target.className==='new-table'){
        //         console.log("in focus");
        //         document.querySelector('#options').style.display = 'unset';}
        //     else
        //         document.querySelector('#options').style.display = 'none';
        // });
    },


    // 
    // ANIMATION
    // 
    afterAnimation: function(li){
        li.addEventListener("animationend", function(){
            if (li.classList.contains('save-item')){
                li.classList.remove('save-item');
            }
            if (li.classList.contains('add-item')){
                li.classList.remove('add-item');
            }
            if (li.firstElementChild.classList.contains('show-item')){
                li.firstElementChild.classList.remove('show-item');
            }
            if (li.classList.contains('remove-item')){
                model.deleteNote();
            }
            if (li.firstElementChild.classList.contains('hide-item')){
                li.classList.add('remove-item');
            }
            
        }, false);
    },

    
    addColumn: function(){
        addColumn.addEventListener('click', function(){
            // make the banner visible
            document.querySelector('.before').addEventListener('click', function(){
                // get the number of rows in the table

                // for each row append a cell before it

            })
        })
    }
}

model.init();
