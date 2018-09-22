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
            view.deselectNote(view.selected);
            view.selected.classList.add('save-item');
            view.selectNote(view.selected);
            
        }

        // Update storage with new changes
        data.updateStorage(); 
        this.isNewNote = false;
    },

    // create a new note
    createNote: function(){
        this.isNewNote = true;
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
        this.isNewNote = true;
    },
    getDate: function(){
        let date = new Date();
        return date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear();
        
    }
    
}

const newNoteButton = document.querySelector('#newnote');
const deleteButton = document.querySelector('#del');
const saveButton = document.querySelector('#save');
const toolbar = document.querySelector('#tools')
const formatTools = document.querySelectorAll('#tools .format');
const contentArea = document.querySelector('#note article');
const today = document.querySelector('#note time');
const sideBar = document.querySelector('#sidebar ul');
const tableButton = document.querySelector('#table');
const listButton = document.querySelector('#list');
const hamburger = document.querySelector('#hamburger');
const close = document.querySelector('#close');
const tableBanner = tableButton.querySelector('.dropdown');

const view = {
    // 
    // INIT
    // 

    selected: '',
    isBannerShown: false,
    init: function(){
        this.disableFormatTools();
        this.disableButton([deleteButton]);

        this.renderSavedNotes();
        model.isNewNote = true;

        let date = model.getFormattedDate();
        today.innerText = date;

        this.newNoteButton();
        this.saveButton();
        this.deleteButton();
        this.contentArea();
     
        this.saveButton();

    },


    // 
    // TOOLBAR
    // 

    enableFormatTools: function(){
        view.enableButton(formatTools);
        tableButton.classList.add('showbanner');
    },
    disableFormatTools: function(){
        view.disableButton(formatTools);

        tableButton.classList.remove('showbanner');
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
            view.disableFormatTools(); 
            view.enableButton([deleteButton]);
            model.saveNote(note);
            
        }); 
    },
    deleteButton: function(){
        deleteButton.addEventListener('click', function(){
            if (deleteButton.disabled){
                return;
            }
            view.selected.querySelector('div').classList.add('hide-item');
            view.disableButton([deleteButton]);
        })
    },
    newNoteButton: function(){
        this.enableButton([newNoteButton]);
        newNoteButton.addEventListener('click',function(){
            view.disableButton([deleteButton]);
            model.isNewNote = true;
            view.deselectNote();
            model.createNote();
        });
    },

    // 
    // TOOLBAR TABLE
    // 


    
    // 
    // SIDEBAR
    // 

    toggleSidebar: function(){
        hamburger.addEventListener('click', function(){
            document.querySelector('#sidebar').style.transform = 'unset';
        })
        close.addEventListener('click', function(){
            console.log('clicked');
            document.querySelector('#sidebar').style.transform = 'translateX(-100%)';
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
            console.log("yes");
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
    },
    openNote: function(li, note, noteId){
        li.addEventListener('click', function(){
            model.isNewNote = false; 
            view.deselectNote();
            view.selectNote(li);
            model.setCurrentNote(note, noteId);
            model.displayNote();
            view.disableFormatTools();
            view.enableButton([deleteButton]);
        });
    },

    //         
    // CONTENT 
    // 

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
    getHeading: function(noteContent){
        let heading = noteContent.split('\n')[0];
            
            if (heading.length > 15 ){
                heading = heading.substr(0, 15);
                heading += '...';
            }
        return heading;
    },
    getSubHeading: function(noteContent){
     
        let subHeading = noteContent.split('\n')[1]
    
            if (subHeading && subHeading.length > 10) {
                subHeading = subHeading.substr(0, 10);
                subHeading += '...';
            }
            else
                subHeading = '';
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
            view.enableFormatTools();            
        });
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
}


model.init();

