/**
 * notes.js - Note class definition and management
 * Contains the Note class and related functions for note manipulation
 */

// Array of note colors
const NOTE_COLORS = ['note-yellow', 'note-blue', 'note-green', 'note-pink'];

/**
 * Represents a single note on the board
 */
export class Note {
    /**
     * Create a new note
     * @param {Object} options - Note initialization options
     * @param {string} options.id - Unique identifier for the note
     * @param {string} options.content - Text content of the note
     * @param {number} options.x - X position on the board
     * @param {number} options.y - Y position on the board
     * @param {string} options.color - CSS class for note color
     * @param {string} options.timestamp - ISO string for creation time
     */
    constructor({ id = null, content = '', x = 0, y = 0, color = null, timestamp = null, image = null }) {
        this.id = id || this.generateId();
        this.content = content;
        this.x = x;
        this.y = y;
        this.color = color || this.getRandomColor();
        this.timestamp = timestamp || new Date().toISOString();
        this.element = null;
        this.image = image || null;
    }

    /**
     * Generate a unique ID for the note
     * @returns {string} Unique ID
     */
    generateId() {
        return 'note_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }

    /**
     * Get a random color for the note
     * @returns {string} CSS class name for the color
     */
    getRandomColor() {
        return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    }

    /**
     * Create the DOM element for this note
     * @returns {HTMLElement} The created note element
     */
    createElement() {
        // Get the note template
        const template = document.getElementById('note-template');
        const noteElement = document.importNode(template.content, true).querySelector('.note');
        
        // Set note properties
        noteElement.id = this.id;
        noteElement.classList.add(this.color);
        noteElement.style.left = `${this.x}px`;
        noteElement.style.top = `${this.y}px`;
        
        // Set content
        const contentElement = noteElement.querySelector('.note-content');
        contentElement.textContent = this.content;

        // Set timestamp
        const timestampElement = document.createElement('div');
        timestampElement.className = 'note-timestamp';
        timestampElement.textContent = this.formatTimestamp();
        noteElement.appendChild(timestampElement);
        
        // Insert image if present
        if (this.image) {
            const img = document.createElement('img');
            img.src = this.image;
            img.className = 'note-image';
            img.alt = 'Note image';
            noteElement.insertBefore(img, noteElement.querySelector('.note-content'));
        }

        // Store reference to the element
        this.element = noteElement;
        return noteElement;
    }

    /**
     * Format the timestamp for display
     * @returns {string}
     */
    formatTimestamp() {
        const date = new Date(this.timestamp);
        return date.toLocaleString();
    }

    /**
     * Update the note's position
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
        }
    }

    /**
     * Update the note's content
     * @param {string} content - New content
     */
    updateContent(content) {
        this.content = content;
        
        if (this.element) {
            const contentElement = this.element.querySelector('.note-content');
            contentElement.textContent = content;
        }
    }

    /**
     * Set the image for this note
     * @param {string} dataUrl - Image as Data URL
     */
    setImage(dataUrl) {
        this.image = dataUrl;
        if (this.element) {
            let img = this.element.querySelector('.note-image');
            if (!img) {
                img = document.createElement('img');
                img.className = 'note-image';
                this.element.insertBefore(img, this.element.querySelector('.note-content'));
            }
            img.src = dataUrl;
        }
    }

    /**
     * Convert note to plain object for storage
     * @returns {Object} Plain object representation of the note
     */
    toObject() {
        return {
            id: this.id,
            content: this.content,
            x: this.x,
            y: this.y,
            color: this.color,
            timestamp: this.timestamp,
            image: this.image
        };
    }

    /**
     * Fetch a random productivity quote and add it to the note
     * @returns {Promise<string>} The quote that was added
     */
    async addRandomQuote() {
        try {
            // Example of fetching from a quote API
            const response = await fetch('https://api.quotable.io/random');
            
            if (!response.ok) {
                throw new Error('Failed to fetch quote');
            }
            
            const data = await response.json();
            const quote = `"${data.content}" — ${data.author}`;
            
            // Add the quote to the current content
            const newContent = this.content 
                ? `${this.content}\n\n${quote}`
                : quote;
            
            this.updateContent(newContent);
            return quote;
        } catch (error) {
            console.error('Error fetching quote:', error);
            return Promise.reject(error);
        }
    }
}

/**
 * Note collection manager
 */
export class NoteManager {
    constructor() {
        this.notes = new Map();
    }

    /**
     * Add a new note
     * @param {Note} note - Note to add
     */
    addNote(note) {
        this.notes.set(note.id, note);
    }

    /**
     * Get a note by ID
     * @param {string} id - Note ID
     * @returns {Note|undefined} The note if found
     */
    getNote(id) {
        return this.notes.get(id);
    }

    /**
     * Remove a note by ID
     * @param {string} id - Note ID
     * @returns {boolean} True if note was removed
     */
    removeNote(id) {
        return this.notes.delete(id);
    }

    /**
     * Get all notes as an array
     * @returns {Note[]} Array of all notes
     */
    getAllNotes() {
        return Array.from(this.notes.values());
    }

    /**
     * Convert all notes to plain objects for storage
     * @returns {Object[]} Array of plain objects
     */
    toJSON() {
        return this.getAllNotes().map(note => note.toObject());
    }
}

// Export a factory function for creating a new note
export function createNote(options = {}) {
    return new Note(options);
}
