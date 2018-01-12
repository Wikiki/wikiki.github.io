'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KEY_BACKSPACE = 8,
    KEY_TAB = 9,
    KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_RIGHT = 39,
    KEY_DELETE = 46,
    KEY_COMMA = 188;

var Tagify = function () {
  function Tagify(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Tagify);

    var defaultOptions = {
      disabled: false,
      delimiter: ',',
      allowDelete: true,
      lowercase: false,
      uppercase: false,
      duplicates: true
    };
    this.element = element;
    this.options = Object.assign({}, defaultOptions, options);

    this.init();
  }

  _createClass(Tagify, [{
    key: 'init',
    value: function init() {
      if (!this.options.disabled) {
        this.tags = [];
        // The container will visually looks like an input
        this.container = document.createElement('div');
        this.container.className = 'tagsinput';
        this.container.classList.add('field');
        this.container.classList.add('is-grouped');
        this.container.classList.add('is-grouped-multiline');
        this.container.classList.add('input');

        var inputType = this.element.getAttribute('type');
        if (!inputType || inputType === 'tags') {
          inputType = 'text';
        }
        // Create an invisible input element so user will be able to enter value
        this.input = document.createElement('input');
        this.input.setAttribute('type', inputType);
        this.container.appendChild(this.input);

        var sib = this.element.nextSibling;
        this.element.parentNode[sib ? 'insertBefore' : 'appendChild'](this.container, sib);
        this.element.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:1px;opacity:0.01;';
        this.element.tabIndex = -1;

        this.enable();
      }
    }
  }, {
    key: 'enable',
    value: function enable() {
      var _this = this;

      if (!this.enabled && !this.options.disabled) {

        this.element.addEventListener('focus', function () {
          _this.container.classList.add('is-focused');
          _this.select(Array.prototype.slice.call(_this.container.querySelectorAll('.tag:not(.is-delete)')).pop());
        });

        this.input.addEventListener('focus', function () {
          _this.container.classList.add('is-focused');
          _this.select(Array.prototype.slice.call(_this.container.querySelectorAll('.tag:not(.is-delete)')).pop());
        });
        this.input.addEventListener('blur', function () {
          _this.container.classList.remove('is-focused');
          _this.select(Array.prototype.slice.call(_this.container.querySelectorAll('.tag:not(.is-delete)')).pop());
          _this.savePartial();
        });
        this.input.addEventListener('keydown', function (e) {
          var key = e.charCode || e.keyCode || e.which,
              selectedTag = void 0,
              activeTag = _this.container.querySelector('.tag.is-active'),
              last = Array.prototype.slice.call(_this.container.querySelectorAll('.tag:not(.is-delete)')).pop(),
              atStart = _this.caretAtStart(_this.input);

          if (activeTag) {
            selectedTag = _this.container.querySelector('[data-tag="' + activeTag.innerHTML.trim() + '"]');
          }
          _this.setInputWidth();

          if (key === KEY_ENTER || key === _this.options.delimiter.charCodeAt(0) || key === KEY_COMMA || key === KEY_TAB) {
            if (!_this.input.value && (key !== _this.options.delimiter.charCodeAt(0) || key === KEY_COMMA)) {
              return;
            }
            _this.savePartial();
          } else if (key === KEY_DELETE && selectedTag) {
            if (selectedTag.nextSibling) {
              _this.select(selectedTag.nextSibling.querySelector('.tag'));
            } else if (selectedTag.previousSibling) {
              _this.select(selectedTag.previousSibling.querySelector('.tag'));
            }
            _this.container.removeChild(selectedTag);
            delete _this.tags[_this.tags.indexOf(selectedTag.getAttribute('data-tag'))];
            _this.setInputWidth();
            _this.save();
          } else if (key === KEY_BACKSPACE) {
            if (selectedTag) {
              if (selectedTag.previousSibling) {
                _this.select(selectedTag.previousSibling.querySelector('.tag'));
              } else if (selectedTag.nextSibling) {
                _this.select(selectedTag.nextSibling.querySelector('.tag'));
              }
              _this.container.removeChild(selectedTag);
              delete _this.tags[_this.tags.indexOf(selectedTag.getAttribute('data-tag'))];
              _this.setInputWidth();
              _this.save();
            } else if (last && atStart) {
              _this.select(last);
            } else {
              return;
            }
          } else if (key === KEY_LEFT) {
            if (selectedTag) {
              if (selectedTag.previousSibling) {
                _this.select(selectedTag.previousSibling.querySelector('.tag'));
              }
            } else if (!atStart) {
              return;
            } else {
              _this.select(last);
            }
          } else if (key === KEY_RIGHT) {
            if (!selectedTag) {
              return;
            }
            _this.select(selectedTag.nextSibling.querySelector('.tag'));
          } else {
            return _this.select();
          }

          e.preventDefault();
          return false;
        });
        this.input.addEventListener('input', function () {
          _this.element.value = _this.getValue();
          _this.element.dispatchEvent(new Event('input'));
        });
        this.input.addEventListener('paste', function () {
          return setTimeout(savePartial, 0);
        });

        this.container.addEventListener('mousedown', function (e) {
          _this.refocus(e);
        });
        this.container.addEventListener('touchstart', function (e) {
          _this.refocus(e);
        });

        this.savePartial(this.element.value);

        this.enabled = true;
      }
    }
  }, {
    key: 'disable',
    value: function disable() {
      if (this.enabled && !this.options.disabled) {
        this.reset();

        this.enabled = false;
      }
    }
  }, {
    key: 'select',
    value: function select(el) {
      var sel = this.container.querySelector('.is-active');
      if (sel) {
        sel.classList.remove('is-active');
      }
      if (el) {
        el.classList.add('is-active');
      }
    }
  }, {
    key: 'addTag',
    value: function addTag(text) {
      var _this2 = this;

      if (~text.indexOf(this.options.delimiter)) {
        text = text.split(this.options.delimiter);
      }
      if (Array.isArray(text)) {
        return text.forEach(function (text) {
          _this2.addTag(text);
        });
      }

      var tag = text && text.trim();
      if (!tag) {
        return false;
      }

      if (this.element.getAttribute('lowercase') || this.options['lowercase'] == 'true') {
        tag = tag.toLowerCase();
      }
      if (this.element.getAttribute('uppercase') || this.options['uppercase'] == 'true') {
        tag = tag.toUpperCase();
      }
      if (this.element.getAttribute('duplicates') == 'true' || this.options['duplicates'] || this.tags.indexOf(tag) === -1) {
        this.tags.push(tag);

        var newTagWrapper = document.createElement('div');
        newTagWrapper.className = 'control';
        newTagWrapper.setAttribute('data-tag', tag);

        var newTag = document.createElement('div');
        newTag.className = 'tags';
        newTag.classList.add('has-addons');

        var newTagContent = document.createElement('span');
        newTagContent.className = 'tag';
        newTagContent.classList.add('is-active');
        this.select(newTagContent);
        newTagContent.innerHTML = tag;

        newTag.appendChild(newTagContent);
        if (this.options.allowDelete) {
          var newTagDeleteButton = document.createElement('a');
          newTagDeleteButton.className = 'tag';
          newTagDeleteButton.classList.add('is-delete');
          newTagDeleteButton.addEventListener('click', function (e) {
            var selectedTag = void 0,
                activeTag = e.target.parentNode,
                last = Array.prototype.slice.call(_this2.container.querySelectorAll('.tag')).pop(),
                atStart = _this2.caretAtStart(_this2.input);

            if (activeTag) {
              selectedTag = _this2.container.querySelector('[data-tag="' + activeTag.innerText.trim() + '"]');
            }

            if (selectedTag) {
              _this2.select(selectedTag.previousSibling);
              _this2.container.removeChild(selectedTag);
              delete _this2.tags[_this2.tags.indexOf(selectedTag.getAttribute('data-tag'))];
              _this2.setInputWidth();
              _this2.save();
            } else if (last && atStart) {
              _this2.select(last);
            } else {
              return;
            }
          });
          newTag.appendChild(newTagDeleteButton);
        }
        newTagWrapper.appendChild(newTag);

        this.container.insertBefore(newTagWrapper, this.input);
      }
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this.tags.join(this.options.delimiter);
    }
  }, {
    key: 'setValue',
    value: function setValue(value) {
      var _this3 = this;

      Array.prototype.slice.call(this.container.querySelectorAll('.tag')).forEach(function (tag) {
        delete _this3.tags[_this3.tags.indexOf(tag.innerHTML)];
        _this3.container.removeChild(tag);
      });
      this.savePartial(value);
    }
  }, {
    key: 'setInputWidth',
    value: function setInputWidth() {
      var last = Array.prototype.slice.call(this.container.querySelectorAll('.control')).pop();

      if (!this.container.offsetWidth) {
        return;
      }
      this.input.style.width = Math.max(this.container.offsetWidth - (last ? last.offsetLeft + last.offsetWidth : 30) - 30, this.container.offsetWidth / 4) + 'px';
    }
  }, {
    key: 'savePartial',
    value: function savePartial(value) {
      if (typeof value !== 'string' && !Array.isArray(value)) {
        value = this.input.value;
      }
      if (this.addTag(value) !== false) {
        this.input.value = '';
        this.save();
        this.setInputWidth();
      }
    }
  }, {
    key: 'save',
    value: function save() {
      this.element.value = this.tags.join(this.options.delimiter);
      this.element.dispatchEvent(new Event('change'));
    }
  }, {
    key: 'caretAtStart',
    value: function caretAtStart(el) {
      try {
        return el.selectionStart === 0 && el.selectionEnd === 0;
      } catch (e) {
        return el.value === '';
      }
    }
  }, {
    key: 'refocus',
    value: function refocus(e) {
      if (e.target.classList.contains('tag')) {
        this.select(e.target);
      }
      if (e.target === this.input) {
        return this.select();
      }
      this.input.focus();
      e.preventDefault();
      return false;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.tags = [];
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.disable();
      this.reset();
      this.element = null;
    }
  }]);

  return Tagify;
}();

document.addEventListener('DOMContentLoaded', function () {
  var tagInputs = document.querySelectorAll('input[type="tags"]');
  [].forEach.call(tagInputs, function (tagInput) {
    new Tagify(tagInput);
  });
});
