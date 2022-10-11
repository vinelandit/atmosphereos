 /**
   * AtmosphereOS guest class, work in progress
   *
   * @constructor
   *
   * @param {String} [name] The name of this project.  If undefined, a name
   *                        will be assigned automatically.
   *
   * @example
   */
  function atmosGuest() {
      // All public configuration is defined as ES5 properties
      // These are just the "private" variables and their defaults.

      this._dirty = false;
      this._init = true;    
      
  }

  Object.defineProperties(atmosGuest.prototype, {
      //The below properties must be implemented by all DataSource instances

      /**.
       * @memberof atmosProject.prototype
       * @type {String}
       */
      

      status : {
          get : function() {
            if(typeof this._data.timeline.items !== 'undefined')
              return this._data.timeline.items;
            else 
              return [];
          },
          set : function(data) {
            
            this._data.timeline.items = data;
            this.save();

          }
      }
  });


  atmosGuest.prototype.send = function(accumulator,value,responseEl) {
      console.log('in send');
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log(this);
          if(responseEl!==null) {
            responseEl.innerHTML = this.response;
          }
        }
      };
      xhttp.open("GET", "./guest/ajax/?accumulator="+accumulator+"&value="+value, true);
      xhttp.send();
  };

  atmosGuest.prototype.goFullScreen = function() {
    var elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
  };

