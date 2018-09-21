const data = {
    currentNote: {
        note: {},
        noteId: null
    },
    isNewNote: true,
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
    init: function(){
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
        if (data.isNewNote){
            
            this.setCurrentNote(note, data.noteId);
            data.notes.push(note);
            view.appendNote(note, data.noteId);


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
            view.editNote(view.selected, note);
        }

        // Update storage with new changes
        data.updateStorage(); 
        data.isNewNote = false;
    },

    // create a new note
    createNote: function(){
        data.isNewNote = true;
        this.setCurrentNote({}, null);
        view.clearContentArea();
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
        view.clearContentArea();
        data.isNewNote = true;
    },
    setIsNewNote: function(bool){
        data.isNewNote = bool;
    },
    getDate: function(){
        let date = new Date();
        return date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear();
        
    }
    
}

const newNoteButton = document.querySelector('#newnote');
const deleteButton = document.querySelector('#del');
const saveButton = document.querySelector('#save');
const formatTools = document.querySelectorAll('#tools .format');
const contentArea = document.querySelector('#note article');
const today = document.querySelector('#note time');
const sideBar = document.querySelector('#sidebar ul');

const view = {
    selected: '',
    init: function(){
        this.disableButton(formatTools);
        this.disableButton([deleteButton]);
        this.renderSavedNotes();

        let date = model.getFormattedDate();
        today.innerText = date;

        newNoteButton.addEventListener('click',function(){
            view.disableButton([deleteButton]);
            model.setIsNewNote(true);
            view.deselectNote();
            model.createNote();
        });

        saveButton.addEventListener('click',function(){
            if (saveButton.disabled){
                return;
            }

            view.disableButton(formatTools); 
            view.enableButton([deleteButton]);
            
            let noteContent = view.getContent();
            if (noteContent){
                let heading = noteContent.split('\n')[0];
                
                if (heading.length > 15 )
                    heading = heading.substr(0, 18)+'...';

                let nextLine = noteContent.split('\n')[1]
                // console.log(nextLine);
                    if (nextLine && nextLine.length > 0) 
                        nextLine = nextLine.substr(0, 13)+'...';
                    else
                        nextLine = '';
                let date = model.getDate();


                let note = {
                    snippet: {
                        heading: heading, 
                        nextLine: nextLine
                    },
                    noteContent: noteContent,
                    date: date
                };
                model.saveNote(note);
            }
        });

        deleteButton.addEventListener('click', function(){
            if (deleteButton.disabled){
                return;
            }
            model.deleteNote();
            view.disableButton([deleteButton])
        })

        contentArea.addEventListener('click',function(){
            view.enableButton(formatTools);            
        });
    },


    clearContentArea: function(){
        contentArea.innerText = '';
    },
    getContent: function(){
        return contentArea.innerText;
    },
    renderContent: function(content){
        this.clearContentArea();
        contentArea.innerText = content;
    },
    getAppendedNotes: function(){
        let notesArray = [];
        let noteList = view.getNoteList();
        let notes = noteList;
        for (note of notes){
            notesArray.push(note);
        }
        notes = notesArray.reverse();
        return notes;
    },
    
    renderSavedNotes: function(){
        console.log("i ran");
        let noteCount = sideBar.childElementCount;
        if (noteCount > 0){
            sideBar.innerHTML = '';
        }
        let notes = model.getNotes();
     
        if (notes.length > 0){
                for(note of notes){
                this.appendNote(note, notes.indexOf(note));
            }
        }
    },
    removeNote: function(menuitem){
        menuitem.remove();
        this.selected = '';
    },
    appendNote: function(note, noteId){
        let li = document.createElement('li');
        let time = document.createElement('time');
        // li.classList.add('')
        time.className = 'date';
        let h4 = document.createElement('h4');
        let div = document.createElement('div');
        let p = document.createElement('p');
        h4.innerHTML = note.snippet.heading;
        p.innerHTML = note.snippet.nextLine;

        time.innerHTML = note.date;

        div.append(h4,p,time);
        li.dataset.id = noteId;
        li.append(div);
        
        sideBar.prepend(li);

        li.addEventListener('click', function(){
            model.setIsNewNote(false);
            
            view.deselectNote();
            view.selectNote(li);
            model.setCurrentNote(note, noteId);
            model.displayNote();
            view.disableButton(formatTools);
            view.enableButton([deleteButton]);
        })
    },

    deselectNote: function(){
        let noteList = view.getNoteList();
        noteList.forEach(function(li){
            if(li.classList.contains('highlight'))
                li.classList.remove('highlight');
        })
    },
    selectNote: function(li){
        // console.log(note);
        li.classList.add('highlight');
        this.selected = li;
    },
    editNote: function(li, note){
        li.querySelector('div h4').innerHTML = note.snippet.heading;
        li.querySelector('div p').innerHTML = note.snippet.nextLine;
        li.querySelector('div time').innerHTML = note.date;
    },
    enableButton: function(buttons){
        for (button of buttons){
            button.disabled = false;
            button.firstElementChild.classList.remove('disabled');
        }
    },
    disableButton: function(buttons){
        for (button of buttons){
            button.disabled = true;
            button.firstElementChild.classList.add('disabled');
        }
    },
    getNoteList: function(){
        return document.querySelectorAll('#sidebar li');
    },
}


model.init();


// TODO
// animate render list
// animate add list item
// animate remove list item