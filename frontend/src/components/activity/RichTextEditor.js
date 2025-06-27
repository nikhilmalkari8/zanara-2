import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Link, List, ListOrdered, 
  Quote, Code, Hash, AtSign, Smile, Image, Video,
  Eye, EyeOff, Maximize2, Minimize2, Type, Palette
} from 'lucide-react';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "What's on your mind?",
  onHashtagSuggestion,
  onMentionSuggestion,
  hashtagSuggestions = [],
  mentionSuggestions = [],
  maxLength = 2000,
  showPreview = false,
  onMediaUpload
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showFormatting, setShowFormatting] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '💪', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈',
    '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝',
    '🔥', '💯', '✨', '⭐', '🌟', '💫', '⚡', '💥', '💢', '💨',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'
  ];

  // Text formatting colors
  const textColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF',
    '#6600FF', '#FF00FF', '#00FFFF', '#FF9999', '#99FF99'
  ];

  useEffect(() => {
    const text = value || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [value]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    
    if (newValue.length <= maxLength) {
      onChange(newValue);
      
      // Handle hashtag suggestions
      const hashtagMatch = newValue.match(/#(\w+)$/);
      if (hashtagMatch && onHashtagSuggestion) {
        onHashtagSuggestion(hashtagMatch[1]);
      }
      
      // Handle mention suggestions
      const mentionMatch = newValue.match(/@(\w+)$/);
      if (mentionMatch && onMentionSuggestion) {
        onMentionSuggestion(mentionMatch[1]);
      }
    }
  };

  const insertText = (textToInsert, selectInserted = false) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    
    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
    
    if (newValue.length <= maxLength) {
      onChange(newValue);
      
      // Set cursor position after insertion
      setTimeout(() => {
        if (selectInserted) {
          textarea.setSelectionRange(start, start + textToInsert.length);
        } else {
          textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
        }
        textarea.focus();
      }, 0);
    }
  };

  const wrapSelectedText = (prefix, suffix = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = (value || '').substring(start, end);
    
    if (selectedText) {
      const wrappedText = prefix + selectedText + (suffix || prefix);
      insertText(wrappedText, true);
    } else {
      insertText(prefix + (suffix || prefix));
    }
  };

  const formatText = (type) => {
    switch (type) {
      case 'bold':
        wrapSelectedText('**');
        break;
      case 'italic':
        wrapSelectedText('*');
        break;
      case 'underline':
        wrapSelectedText('__');
        break;
      case 'code':
        wrapSelectedText('`');
        break;
      case 'quote':
        insertText('\n> ');
        break;
      case 'link':
        wrapSelectedText('[', '](url)');
        break;
      case 'list':
        insertText('\n- ');
        break;
      case 'ordered-list':
        insertText('\n1. ');
        break;
      case 'hashtag':
        insertText('#');
        break;
      case 'mention':
        insertText('@');
        break;
      default:
        break;
    }
  };

  const insertEmoji = (emoji) => {
    insertText(emoji);
    setShowEmojiPicker(false);
  };

  const insertHashtag = (hashtag) => {
    const currentValue = value || '';
    const newValue = currentValue.replace(/#\w*$/, `#${hashtag} `);
    onChange(newValue);
  };

  const insertMention = (mention) => {
    const currentValue = value || '';
    const newValue = currentValue.replace(/@\w*$/, `@${mention.firstName}${mention.lastName} `);
    onChange(newValue);
  };

  const handleMediaUpload = (files) => {
    if (onMediaUpload) {
      onMediaUpload(files);
    }
  };

  const renderPreview = () => {
    if (!value) return <div className="text-gray-400 italic">Nothing to preview</div>;
    
    // Simple markdown-like rendering
    let preview = value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
      .replace(/#(\w+)/g, '<span class="text-blue-600 font-medium">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-purple-600 font-medium">@$1</span>')
      .replace(/\n/g, '<br>');
    
    return <div dangerouslySetInnerHTML={{ __html: preview }} />;
  };

  const formatButtons = [
    { type: 'bold', icon: Bold, label: 'Bold (Ctrl+B)', shortcut: 'Ctrl+B' },
    { type: 'italic', icon: Italic, label: 'Italic (Ctrl+I)', shortcut: 'Ctrl+I' },
    { type: 'underline', icon: Underline, label: 'Underline (Ctrl+U)', shortcut: 'Ctrl+U' },
    { type: 'code', icon: Code, label: 'Code', shortcut: 'Ctrl+`' },
    { type: 'quote', icon: Quote, label: 'Quote', shortcut: 'Ctrl+Shift+>' },
    { type: 'link', icon: Link, label: 'Link (Ctrl+K)', shortcut: 'Ctrl+K' },
    { type: 'list', icon: List, label: 'Bullet List', shortcut: 'Ctrl+Shift+8' },
    { type: 'ordered-list', icon: ListOrdered, label: 'Numbered List', shortcut: 'Ctrl+Shift+7' },
    { type: 'hashtag', icon: Hash, label: 'Hashtag', shortcut: '#' },
    { type: 'mention', icon: AtSign, label: 'Mention', shortcut: '@' }
  ];

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
      {/* Toolbar */}
      {showFormatting && (
        <div className="border-b border-gray-200 p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Formatting Buttons */}
            <div className="flex items-center space-x-1">
              {formatButtons.map((button) => {
                const Icon = button.icon;
                return (
                  <button
                    key={button.type}
                    onClick={() => formatText(button.type)}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    title={button.label}
                  >
                    <Icon className="w-4 h-4 text-gray-600" />
                  </button>
                );
              })}
              
              <div className="w-px h-6 bg-gray-300 mx-2" />
              
              {/* Emoji Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4 text-gray-600" />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-64">
                    <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 hover:bg-gray-100 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Color Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title="Text Color"
                >
                  <Palette className="w-4 h-4 text-gray-600" />
                </button>
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                    <div className="grid grid-cols-5 gap-2">
                      {textColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setTextColor(color);
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Media Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Upload Media"
              >
                <Image className="w-4 h-4 text-gray-600" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(Array.from(e.target.files))}
                className="hidden"
              />
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {showPreview && (
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`p-2 rounded-md transition-colors ${
                    isPreviewMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
                >
                  {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
              
              <button
                onClick={() => setShowFormatting(!showFormatting)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Toggle Formatting"
              >
                <Type className="w-4 h-4 text-gray-600" />
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 text-gray-600" /> : <Maximize2 className="w-4 h-4 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Editor Content */}
      <div className="relative">
        {isPreviewMode ? (
          <div className="p-4 min-h-32 prose max-w-none">
            {renderPreview()}
          </div>
        ) : (
          <textarea
            ref={editorRef}
            value={value || ''}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="w-full p-4 border-none outline-none resize-none min-h-32 text-gray-900"
            style={{ 
              color: textColor,
              fontSize: '16px',
              lineHeight: '1.5',
              fontFamily: 'inherit'
            }}
            rows={isFullscreen ? 20 : 6}
          />
        )}
        
        {/* Hashtag Suggestions */}
        {hashtagSuggestions.length > 0 && (
          <div className="absolute top-full left-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-w-xs">
            <div className="p-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Suggested Hashtags</span>
            </div>
            <div className="max-h-32 overflow-y-auto">
              {hashtagSuggestions.map((hashtag, index) => (
                <button
                  key={index}
                  onClick={() => insertHashtag(hashtag.tag)}
                  className="w-full text-left p-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Hash className="w-3 h-3 text-blue-600" />
                  <span className="text-sm">{hashtag.displayTag}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {hashtag.stats?.totalUses || 0} uses
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Mention Suggestions */}
        {mentionSuggestions.length > 0 && (
          <div className="absolute top-full left-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-w-sm">
            <div className="p-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Suggested People</span>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {mentionSuggestions.map((user, index) => (
                <button
                  key={index}
                  onClick={() => insertMention(user)}
                  className="w-full text-left p-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <img
                    src={user.profilePicture || '/default-avatar.png'}
                    alt={user.firstName}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.headline || user.professionalType}
                    </div>
                  </div>
                  <AtSign className="w-3 h-3 text-purple-600" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{wordCount} words</span>
          <span>{(value || '').length}/{maxLength} characters</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs">
            Supports **bold**, *italic*, #hashtags, @mentions
          </span>
        </div>
      </div>
      
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
};

export default RichTextEditor; 