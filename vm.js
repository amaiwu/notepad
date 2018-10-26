// View model
const model = {
    unsavedNewNote: false,
    isNewNote: false,
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
        view.clearContentArea();
        view.enableButton([deleteButton]);
    },

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