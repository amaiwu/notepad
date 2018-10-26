const view = {
    // 
    // INIT
    // 

    selected: '',
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

            view.showLandingPage();
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
        this.firstNoteButton();
    },
    enableDocTools: function(){
        view.enableButton(docTools);
    },
    disableDocTools: function(){
        view.disableButton(docTools);
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

    hideLandingPage: function() {
        document.querySelector('#sidebar').style.display = 'unset';
        document.querySelector('header').style.display = 'unset';
        document.querySelector('#sidebar').classList.remove('empty');
        document.querySelector('nav').classList.remove('empty');
        document.querySelector('#landing-page').style.display = 'none';
        document.querySelector('#note').style.display = 'unset';
    },
    showLandingPage: function() {
        document.querySelector('#sidebar').style.display = 'unset';
        document.querySelector('header').style.display = 'unset';
        document.querySelector('#landing-page').style.display = 'unset'
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
