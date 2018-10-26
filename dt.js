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