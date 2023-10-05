  timeFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ";
  function bindToForm(formElement,object) {
    changeMoratorium = true;
    // write each element in object to form

    var t = formElement.find('.bind');
    t.each(function(){
      var n = $(this).attr('name');
      
      var path = n.split('-');
      var p = 'if(typeof object.'+path.join('.')+' !== "undefined") object.'+path.join('.')+'; else null';
      
      var s = eval(p);
      if(s!==null) {
        $(this).val(s);
        $(this).attr('value',s);
        if($(this).attr('name')=='id') {
          $(this).attr('data-oldID',s);
        }
      }
    });

    changeMoratorium = false;
    
  }
  function populateChannelDropdowns() {
    var t = $('.channelsDropdown');

    var tc = project.timelineChannels;
    t.each(function(){

      var index = $(this)[0].options.length;
      for(i in tc) {
        var id = tc[i].id;
        $(this)[0][index] = new Option(id,id);
        index++;
      }
    });

  }
  function populateActionDropdowns() {
    var t = $('.actionsDropdown');

    var a = project.actions;
    t.each(function(){

      var index = $(this)[0].options.length;
      for(i in a) {
        var id = a[i].id;
        $(this)[0][index] = new Option(id,id);
        index++;
      }
    });

  }
  function populateProjectDropdowns() {
    var t = $('.projectsDropdown');
    var l = project.getSavedProjects;

    t.each(function(){
      t.html('');
      var index = 0;
      for(i in l) {
        $(this)[0][index] = new Option(l[i],i);
        index++;
      }
      t.val(project.id);
    });
    

  }

  function saveFromForm(formElement,object,infixPath) {
    // put validation here
    if(typeof infixPath === 'undefined') {
      infixPath = '';
    } 
    if(infixPath=='') {
      var checkInfixPath = '';
    } else {
      var checkInfixPath = '.'+infixPath;
    }
    if(typeof project !== 'undefined') {
     var s = formElement.find('.bind');
      s.each(function(){
        var n = $(this).attr('name');
        
        var path = n.split('-');

        var subPath = '';
        for(i in path) {

          subPath += '.'+path[i];
          evalStr = ` if (typeof object`+checkInfixPath+subPath+` === 'undefined') object`+checkInfixPath+subPath+` = {} `;
          console.log(evalStr);
          fillNew = eval (evalStr);
        }
        var p = 'object'+checkInfixPath+'.'+path.join('.')+' = `'+$(this).val()+'`';
        
        // var t = eval(p.replace('\n','\\n'));
        var t = eval(p);
        console.log(t);
        
      });   
      project.fullData = object;
      console.log('Object saved');  
      console.log(project.fullData);
      return true;
    } else {
      console.log('Project not defined.');
    }


  }
function updateVideoDuration(filename){
  var url = '/video/'+filename;
  // create instance of HTML5 video to determine running time
  var v = $('#hiddenVideo video')[0];
  v.src=url;
  v.addEventListener('loadedmetadata', function() {
    $('input[name="video-duration"]').val(v.duration);
  });
}
$(document).ready(function() {

  $('.checkinURL').html('http://'+localIP+':'+httpPort+'/checkin');

  hueActions = ['Hue colour','Hue on'];
  moodoActions = ['Moodo'];

  channels = new vis.DataSet();
  hueDevices = [];
  moodoDevices = [];
  devices = [];


  // initialise movie cue editor
  /* $('.sidebar-brand').click(function(e){
    e.preventDefault();
    $('#movieCuesOverlay').show().html('<iframe style="border-width:0;position:fixed;left:2vw;width:96vw;top:2vh;height:96vh" src="/js/amalia/samples/ajs-plugin-timeline.html?projectID='+project.id+'&itemID=i123987&targetID=mac mini"></iframe>');
      
  }); */



                   


  $('.nudge-forward,.nudge-back').click(function(){
    var channel = $('#nudgeChannel').val();

    var minutes = parseFloat($('input[name="nudge"]').val());
    if(minutes>0) {
      if($(this).hasClass('nudge-back')) minutes = 0-minutes;
      // move all items by the required number of minutes, then reload
      var items = project.timelineItems;
      for(i in items) {
        if(channel=='all'||channel==items[i].group) {
          var newStart = moment(items[i].start).add(minutes,'minutes');
          var newEnd = moment(items[i].end).add(minutes,'minutes');
          items[i].start = newStart.toISOString();
          items[i].end = newEnd.toISOString();
        }
      }
      project.timelineItems = items;
      // nudge main project start/end
      if(channel=='all') {

        var newStart = moment(project.startTime).add(minutes,'minutes');
        var newEnd = moment(project.endTime).add(minutes,'minutes');


        project.startTime = newStart.toISOString();
        project.endTime = newEnd.toISOString();
      }
      document.location.reload();
    }

  });
  $('.duplicate-forward,.duplicate-back').click(function(){
    var seconds = parseFloat($('input[name="duplicate-offset"]').val());
    if(seconds>=0) {
      if($(this).hasClass('duplicate-back')) seconds = 0-seconds;
      var sChannel = $('#fromChannel').val();
      var tChannel = $('#toChannel').val();
      var err = '';
      if(sChannel==tChannel) err = 'From channel needs to be different from to channel.';
      if(
        sChannel.indexOf('Hue ')==0&&tChannel.indexOf('Hue ')!=0||
        tChannel.indexOf('Hue ')==0&&sChannel.indexOf('Hue ')!=0||
        sChannel.indexOf('Moodo ')==0&&tChannel.indexOf('Moodo ')!=0||
        tChannel.indexOf('Moodo ')==0&&sChannel.indexOf('Moodo ')!=0
        ) err = 'You can only duplicate between channels of the same type (media screens, Hue devices etc.)';
      if(err!='') {
        alert(err);
        return false;
      }
      if(confirm("Warning: duplicating will remove all events currently on the target channel. Are you sure?")) {
        

        var date = new Date();
        var timestamp = date.getTime();
        // duplicate all items by the required number of minutes, then reload
        var items = project.timelineItems;
        var dups = [];
        var dels = [];
        for(i in items) {
          if(items[i].group==sChannel) dups.push({ ...items[i]});
          if(items[i].group==tChannel) dels.push(i);
        }
        console.log(dels);
        /* for(i=dels.length-1;i>=0;i--) {
          console.log('deleting item '+dels[i]+' on channel '+tChannel);
          delete items[dels[i]];
        } */

        for(i in dups) {
          for(index in items) {
            if(items[index].id==dups[i].id) {
              dups[i].id += 'd';
            }
          }
          dups[i].group = tChannel;
          if(seconds!=0) {
            // offset by supplied number of seconds
            console.log(dups[i].start);
            var newStart = moment(dups[i].start).add(seconds,'seconds').format(timeFormat);
            var newEnd = moment(dups[i].end).add(seconds,'seconds').format(timeFormat);
            
            dups[i].start = newStart;
            dups[i].end = newEnd;
          }
          items.push(dups[i]);
        }

        console.log('DUPS');
        console.log(dups);
        console.log(items);
        
        project.timelineItems = items;
        
        document.location.reload(); 
             
      }
      
    }

  });
  $('.goLiveNow').click(function(){
    var secs = $('#goLiveIn').val();
    if(parseInt(secs)>=4) {
      // adjust the earliest event to happen in secs seconds, and all the other events by the same amount.
      var earliest = -1;
      var latest = -1;
      var items = project.timelineItems;

      for(i in items) {
        var s = moment(items[i].start);
        var e = moment(items[i].end);
        if(earliest==-1||s.isSameOrBefore(earliest)) {
          earliest = s;
        }
        

      }
      // find delta between earliest + 10 seconds and now
      var newStart = earliest.add(-secs,'seconds');
      var delta = moment.duration(new moment().diff(newStart));

      for(i in items) {
        var newStart = moment(items[i].start).add(delta);
        var newEnd = moment(items[i].end).add(delta);
        items[i].start = newStart;
        items[i].end = newEnd;
        if(latest==-1||newEnd.isSameOrAfter(newEnd)) {
          latest = newEnd;
        }
      }
      project.timelineItems = items;
      // nudge main project start/end
      project.startTime = moment(project.startTime).add(delta);
      project.endTime = moment(project.endTime).add(delta);
      
      document.location.href='#goLive';
      document.location.reload();
    } else {
      alert('The system needs at least 12 seconds to prepare media on other devices.');
      // TODO: make the wait time automatic and go live
    }
  });
  $('.clone-forward,.clone-back').click(function(){
    var channel = $('#cloneChannel').val();
    var minutes = parseFloat($('input[name="clone"]').val());
    if(minutes>0) {
      if($(this).hasClass('clone-back')) minutes = 0-minutes;
      // clone all items by the required number of minutes, then reload
      // to do: preserve hierarchical relationships for sync children
      var items = project.timelineItems;
      for(i in items) {
        if(channel=='all'||channel==items[i].group) {
          var newStart = moment(items[i].start).add(minutes,'minutes');
          var newEnd = moment(items[i].end).add(minutes,'minutes');

          var newItem = { ...items[i] };
          newItem.id=items[i].id+'c'+Date.now();
          newItem.start = newStart.toISOString();
          newItem.end = newEnd.toISOString();
          items.push(newItem);
        }
      }
      project.timelineItems = items;
      
      document.location.reload();
    }

  });
  var changeMoratorium = false;
  function refreshFileDropdowns(target,selected) {
    var folder = target.attr('data-folder');
    console.log(folder);
      $.get('/folder/'+folder,function(data){
        data = JSON.parse(data);
        // console.log(data);
        var html = '';
        if(folder=='images'||folder=='csv') {
          html += '<option value="">none</option>';
        }
        
        for(j in data) {
          html += '<option value="'+data[j]+'">'+data[j]+'</option>';
        }
        if(folder=='fonts') {
          html += '<option value="sans-serif">Arial/Helvetica</option>';
          html += '<option value="serif">Roman</option>';
          html += '<option value="monotype">Courier/Monotype</option>'
        }
        target.html(html);
        if(typeof selected !== 'undefined' && selected) {
          // console.log('attempting to select '+selected);
          target.val(selected);
        }

        if(folder=='video') updateVideoDuration(target.val());
      });
      
  }
  $(document).off('click','#actionForm .refresh-video-list').on('click','#actionForm .refresh-video-list',function(){
    var t = $('#actionForm [name="video-filename"]');
    refreshFileDropdowns(t,t.val());
  });  
  $(document).off('change','[name="video-filename"]').on('change','[name="video-filename"]',function(){
    updateVideoDuration($(this).val());

  });
  $(document).off('change','.projectsDropdown').on('change','.projectsDropdown',function(){
    var newID = $(this).val();
    document.location.href = '?projectID='+newID;
  });
  $(document).off('click','.btn-delete-project').on('click','.btn-delete-project',function(){
    var deleteID = $(this).attr('data-project-id');
  
    if(confirm("Are you sure you want to delete this project?")) {
      localStorage.removeItem('atmosProject_'+deleteID);
      
      document.location.href="?projectID=1";
    }      
    
  });  
  $(document).off('click','.btn-clone-project').on('click','.btn-clone-project',function(e){
    e.preventDefault();

    
    project.id = 0;

    var newid = project.id;
    project.name = project.name + ' CLONE';
    
    document.location.href="?projectID="+newid;
    
  });  
  $(document).off('click','#attendeesFileRefresh').on('click','#attendeesFileRefresh',function(){
    var t = $('#attendeesFile');
    refreshFileDropdowns(t,t.val());
  });
  $(document).off('change','#actionForm [name="type"]').on('change','#actionForm [name="type"]',function(){
    if(!changeMoratorium) {
      $('#actionTypeDetails').html(front['actionForm-'+$(this).val()]);
      if($(this).val()=='video') {

        refreshFileDropdowns($('#actionForm [name="video-filename"]'),$('#actionForm [name="video-filename"]').val());
      }
    }
  });
  $(document).off('click','#actionForm .refresh-video-list').on('click','#actionForm .refresh-video-list',function(){
    var t = $('#actionForm [name="video-filename"]');
    refreshFileDropdowns(t,t.val());
  }); 
  function wcInitScan() {
 
      if(typeof searchTimer !== 'undefined') {
        window.clearInterval(searchTimer);
      }
      var ipIndex = 1;
      wcInit = false;
      var wc = localStorage.getItem('webcamURL');
      if(wc!='') {
        var temp = wc.split('?');
        $('#magicImage').attr('src',temp[0] + '?' + new Date().getTime());
        $('#magicImage').attr('crossOrigin', '');
        var temp = wc.split(':');
        var temp = temp[1].split('.');
        ipIndex = parseInt(temp[3])+1;

        wcInit = true;
      }


      var temp = localIP.split('.');
      var blockPrefix = temp[0]+'.'+temp[1]+'.'+temp[2];
  
    

       searchTimer = window.setInterval(function(){
        if(wcInit) {
          ipIndex=1;
          wcInit = false;
        }
        $('#colourStatus').html('Searching on '+blockPrefix+'.'+ipIndex+'...');
        $('#magicImage').attr('src','http://'+blockPrefix+'.'+ipIndex+':8080/video');
        ipIndex++;
        if(ipIndex>=256) {
          $('#colourStatus').html('No webcam server found.');
          $('.badge-counter-camera').html('<i class="fa fa-cross"></i>');
          window.clearInterval(searchTimer);
        }
      },3000);

      $("#magicImage").on("load", function () {

        $('#colourStatus').html('Found webcam server at '+blockPrefix+'.'+(ipIndex-1));

        $('.badge-counter-camera').removeClass('badge-primary').addClass('badge-success').html('<i class="fa fa-check"></i>');
        localStorage.setItem('webcamURL','http://'+blockPrefix+'.'+(ipIndex-1)+':8080/video');
        window.clearInterval(searchTimer);
        
        var thecanvas = document.getElementById('magicImage');

        if(!wcInit) {
          var temp = thecanvas.src.split('?');
          thecanvas.src = temp[0] + '?' + new Date().getTime();
          wcInit = true;
        }
        thecanvas.setAttribute('crossOrigin', '');

 

        
        window.setInterval(function(){
            //var
            //    fac = new FastAverageColor(),
            //    color = fac.getColor(thecanvas);
 
            var colorThief = new ColorThief();
 
            // console.log(color);
            /* var hsv = rgb2hsv(color.value[0],color.value[1],color.value[2]);
            if(hsv[2]>50) {
              var body = {
                "on":true,
                "sat":hsv[1],
                "bri":hsv[2],
                "hue":hsv[0]
              }
            } else {
              var body = {
                "on":false
              }
            }

            sendHue(connection,body,'!all'); */
            var colours = colorThief.getPalette(thecanvas,3,20);
            processColours(colours);

           
        },500);


      });
  }

  $('.goLive').click(function(e){
    e.preventDefault();
    // console.log('LIVE',project.fullData);
    goLive(connection,project.fullData);
    // populate live cueboard
    var cb = project.cueboardItems;
    var t = $('#cueboardContainer');
    var html = '';
    for(i in cb) {
      html += ejs.render(front['cueboard-live'],{data:cb[i]});
    }
    t.html(html);

    // cueboard handlers
    $(document).off('keydown').on('keydown',function(e){
      var key = String.fromCharCode(e.which).toLowerCase();
      $('.cueboardItem[data-hotkey="'+key+'"]').click();
    });
    $(document).off('click','.cueboardItem').on('click','.cueboardItem',function(){

      // collect info
      var actionID = $(this).attr('data-actionID');
      var channel = $(this).attr('data-channel');
      var duration = $(this).attr('data-duration');
      var fadeIn = $(this).attr('data-fadeIn');
      var fadeOut = $(this).attr('data-fadeOut');
      var color = $(this).attr('data-color');
      var moodoSlot0 = $(this).attr('data-moodoSlot0');
      var moodoSlot1 = $(this).attr('data-moodoSlot1');
      var moodoSlot2 = $(this).attr('data-moodoSlot2');
      var moodoSlot3 = $(this).attr('data-moodoSlot3');


      if(actionID.toLowerCase().indexOf('hue ')==0) {
        if(actionID=='Hue colour') {
          var latch = false;
          if(duration==0) latch = true;
          duration = duration - fadeOut;
          var myRGB = hex2rgb(color);
          var myHSV = rgb2hsv(myRGB.r,myRGB.g,myRGB.b);
          sendHue(connection,channel,{
            "on":true,
            "hue":myHSV[0],
            "sat":myHSV[1],
            "bri":myHSV[2],
            "transitiontime":fadeIn*10
          });
          if(!latch) {
            window.setTimeout(function(){
              sendHue(connection,channel,{
                "on":false,
                // "bri":0,
                "transitiontime":fadeOut*10
              });
            },duration*1000);
          }

        } else if (actionID=='Hue on') {
          // on state only
          sendHue(connection,channel,{
            "on":true
          });
          window.setTimeout(function(){
            sendHue(connection,channel,{
              "on":false
            });
          },duration*1000);
        } else if (actionID=='Hue off') {
          // just turn off
          sendHue(connection,channel,{
            "on":false,
            "transitiontime":fadeOut*10
          });
        }
      } else if(actionID.toLowerCase().indexOf('moodo')==0) {
        
        if(actionID=='Moodo') {
            if(duration==0) latch = true;
        
            sendMoodo(connection,channel,{
              slot0: moodoSlot0,
              slot1: moodoSlot1,
              slot2: moodoSlot2,
              slot3: moodoSlot3
            });
            if(!latch) {
              window.setTimeout(function(){
                sendMoodo(connection,channel,{
                  slot0: 0,
                  slot1: 0,
                  slot2: 0,
                  slot3: 0
                });
              },duration*1000);
            }
        } else if (actionID=='Moodo off') {
            sendMoodo(connection,channel,{
              slot0: 0,
              slot1: 0,
              slot2: 0,
              slot3: 0
            });
        }
        
        

        
      } else {
        var response = {
          "to":channel,
          "command":"action",
          "actionID":actionID,
          "duration":duration,
          "fadeIn":fadeIn,
          "fadeOut":fadeOut,
          "senderAlias":'MASTER'
        }
        connection.send(JSON.stringify(response));  
      }

      $(this).removeClass('used').addClass('down');
      // increment hit count
      $(this).find('.cueboardBadge').html(parseInt($(this).find('.cueboardBadge').html())+1);
      var _this = $(this);
      window.setTimeout(function(){
        _this.removeClass('down').addClass('used');
      },250);
    });
    // show live panel
    $('.nodal').slideDown('fast');

    // disable elements that can't be used in live mode
    $('.editTimelineItem,.navbar-nav,.vis-center .vis-content,.items-panel,.nudgeRow,#checkinHolder,#accHolder').each(function(){
      var d = $(this).css('position');
      if(d!='absolute'&&d!='relative'&&d!='fixed') {
        $(this).css({'position':'relative'});
      }
      $(this).prepend('<div class="donttouch"></div>');
    });

    // start rolling mode on timeline
    timeline.toggleRollingMode();

    // show channel mute buttons
    $('.btn-mute').css({'visibility':'visible'});
    $(document).off('click','.btn-mute').on('click','.btn-mute',function(e) {
      e.preventDefault();
      var s = $(this).attr('data-mute');
      if(s=='on') {
        // turn it off
        $(this).attr('data-mute','off')
          .find('.fa')
          .removeClass('text-warning')
          .addClass('text-success')
          .removeClass('fa-volume-mute')
          .addClass('fa-volume-up');
        var i = $(this).closest('.vis-label').removeClass('muted').index('.vis-left .vis-labelset .vis-label');
        $('.vis-center .vis-content .vis-itemset .vis-foreground .vis-group:eq('+i+')').removeClass('muted');

        // send command to server
        var channel = $(this).attr('data-id');
        var response = {
          "to":'SERVER',
          "command":"unmute",
          "channel":channel,
          "senderAlias":'MASTER'
        }
        connection.send(JSON.stringify(response));
      } else {
        // turn it on
        $(this).attr('data-mute','on')
          .find('.fa')
          .addClass('text-warning')
          .removeClass('text-success')
          .addClass('fa-volume-mute')
          .removeClass('fa-volume-up');
        var i = $(this).closest('.vis-label').addClass('muted').index('.vis-left .vis-labelset .vis-label');
        $('.vis-center .vis-content .vis-itemset .vis-foreground .vis-group:eq('+i+')').addClass('muted');
        
        // send command to server
        var channel = $(this).attr('data-id');
        var response = {
          "to":'SERVER',
          "command":"mute",
          "channel":channel,
          "senderAlias":'MASTER'
        }
        connection.send(JSON.stringify(response));
      }
    });
  });
  $('.closeLive').click(function (e) {
    if(!confirm("Are you sure you want to exit live mode? All scheduled events will be cancelled and devices will be turned off.")) {
       
      e.preventDefault();
      return false;
    } else {
      var response = {
        "to":'SERVER',
        "command":"haltLive",
        "senderAlias":'MASTER'
      }
      connection.send(JSON.stringify(response)); 

      // re-enable elements that can't be used in live mode
      $('.donttouch').remove();

      // hide live panel
      $('.nodal').slideUp('fast');

      // stop rolling mode on timeline
      timeline.toggleRollingMode();
      
      // hide channel mute buttons
      $('.btn-mute').css({'visibility':'hidden'}).attr('data-mute','off').find('.fa').removeClass('fa-volume-mute').addClass('fa-volume-up').removeClass('text-warning').addClass('text-success');
      $('.muted').removeClass('muted');

      // remove key bindings for cueboard
      $(document).off('keydown');

    }
  });
  $('.showProjectSettings').click(function(e){
    e.preventDefault;
    populateProjectDropdowns();
    $('.btn-delete-project').attr('data-project-id',project.id);
  });
  $('#projectSettingsModal .btn-primary').click(function(e){
    e.preventDefault();
    var result = saveFromForm($('#projectSettingsForm'),project.fullData);
    if(result) {
      document.location.reload();
    }
  });
  $('.nav-link[data-target="#projectSettingsModal"]').click(function(e){
    e.preventDefault();
    console.log('Borking with '+project.attendeesFile);
    refreshFileDropdowns($('#attendeesFile'),project.attendeesFile);
  });
  $('.new-action').click(function(e){
    e.preventDefault();
    // clear form
    $('#actionTypeDetails').html(front['actionForm-text']);
    $('#actionForm .bind').val('');
    $('#actionForm [name="type"]').val('text');
    refreshFileDropdowns($('#actionForm [name="text-font"]'),false);
    refreshFileDropdowns($('#actionForm [name="text-additionalFont"]'),false);
    refreshFileDropdowns($('#actionForm [name="text-image"]'),false);
  });

  $('#actionsModal .save-action').click(function(e){
    e.preventDefault();
    var p = project.fullData;
    var nameChange = false;
    var newAction = false;
    var myID = $('#actionForm input[name="id"]').val();
    if(myID.toLowerCase().indexOf('hue ')==0) {
      alert('Action names beginning with "Hue" are reserved for preset Philips Hue actions. Please choose another.');
      return false;
    }
    if(myID.toLowerCase().indexOf('moodo ')==0) {
      alert('Action names beginning with "Moodo" are reserved for preset Moodo actions. Please choose another.');
      return false;
    }
    // first check for new name not already in use
    var myOldID = $('#actionForm input[name="id"]').attr('data-oldID');
    if(myID!=myOldID) {
      if(myOldID=='') {
        // new item
        console.log('new item');
        
        if(project.getAction(myID)) {
          alert('Action name already in use');
          return false;
        }  
        p.actions[myID] = {};
        newAction = true;      
      } else {
        if(project.getAction(myID)) {
          alert('Action name already in use');
          return false;
        }
        nameChange = true;
        var newName = myID;
        myID = myOldID;
      }
    }
    var result = saveFromForm($('#actionForm'),p,'actions["'+myID+'"]');
    


    if(nameChange) {
      console.log('Name change?');
      // rename the action, then update references to it in the timelines
      project.renameAction(myID,newName);
    }

    if(result&&(nameChange||newAction)) {
     
      document.location.reload();
    }
    if(result&&!nameChange) {
      $('#actionsModal').modal('hide');
    }
    if(!result) {
      alert('Error updating action.');
    }
  });


  
  $('.date').datetimepicker({
    'format':'YYYY-MM-DD:HH:mm:00Z'
  });


  /**
   * AtmosphereOS project class, work in progress
   *
   * @constructor
   *
   * @param {String} [name] The name of this project.  If undefined, a name
   *                        will be assigned automatically.
   *
   * @example
   * var dataSource = new Cesium.WebGLGlobeDataSource();
   * dataSource.loadUrl('sample.json');
   * viewer.dataSources.add(dataSource);
   */
  function atmosProject(id) {
      // All public configuration is defined as ES5 properties
      // These are just the "private" variables and their defaults.

      var start = moment().toISOString();
      var end = moment().add(2,'hours').toISOString();
      var startVideo = moment().add(5,'minutes').toISOString();
      var endVideo = moment().add(1,'hours').toISOString();
      var startOne = moment().add(6,'minutes').toISOString();
      var endOne = moment().add(7,'minutes').toISOString();
      var startTwo = moment().add(10,'minutes').toISOString();
      var endTwo = moment().add(11,'minutes').toISOString();
      this._currentParentItemID = null;
      this._data = {
        'name':'New Project',
        'venue':'',
        'webcam': {
          'type':''
        },
        'attendeesFile': '',
        'hue':'',
        'actions':{
          'sample text action': {
            'id':'sample text action',
            'type':'text',
            'text': {
              'headline':'This is a sample message',
              'color':'#dd3333',
              'font':'sans-serif',
              'additional': 'This is some extra text',
              'color':'#33dd33',
              'image':'doge.jpeg'
            }
          },
          'sample video action': {
            'id':'sample video action',
            'type':'video',
            'video': {
              'filename':'sherbet_cortex2.mp4'
            }
          }
        },
        'timeline': {
          'channels':[ 
              {
                'id':'test target device 1',
                'content':'test target device 1'
              },
               {
                'id':'test target device 2',
                'content':'test target device 2'
              }            
          ],
          'options': {
            'start':start,
            'end':end,
            'max':start,
            'min':end
          },
          'items': [   
            {
              'id':'firstItem',
              'actionID':'sample video action',
              'type':'range',
              'fadeIn':0,
              'fadeOut':0,
              'content':'<span class="itemGubbins"><i class="fa fa-camera"></i></span> sample video action',
              'group':'test target device 1',
              'start':startVideo,
              'end':endVideo
            },
            {
              'id':'secondItem',
              'type':'range',
              'content':'<span class="itemGubbins"><i class="fa fa-newspaper"></i></span> sample text action',
              'group':'test target device 2',
              'actionID':'sample text action',
              'fadeIn':0.5,
              'fadeOut':0.5,
              'start':startOne,
              'end':endOne
            },            {
              'id':'thirdItem',
              'type':'range',
              'content':'<span class="itemGubbins"><i class="fa fa-newspaper"></i></span> sample text action',
              'group':'test target device 2',
              'actionID':'sample text action',
              'fadeIn':0.25,
              'fadeOut':0.25,
              'start':startTwo,
              'end':endTwo
            },
          ]
        }
        
      };

      this._dirty = false;
      this._init = true;
      
      if(typeof id !== 'undefined' && parseInt(id)>0) {
        // read data from database with provided ID
        this.load(id);
      } else {
        // check for recent
        if(localStorage.getItem('atmosProject_lastID')>0) {
          this.load(localStorage.getItem('atmosProject_lastID'));
        } else {
          // brand new  
          this._id = 0;
          id = 0;
          this.save();
        }
      }

      
  }

  Object.defineProperties(atmosProject.prototype, {
      //The below properties must be implemented by all DataSource instances

      /**.
       * @memberof atmosProject.prototype
       * @type {String}
       */
      id : {
          get : function() {
              return this._id;
          },
          set: function(newid) { // used when cloning
            this._id = newid;
            this.save();
          }
      },


      timelineItems : {
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
      },
      timelineOptions : {
          get : function() {
            if(typeof this._data.timeline.options !== 'undefined')
              return this._data.timeline.options;
            else 
              return [];
          }
      },
      attendeesFile : {
          get : function() {
            if(typeof this._data.attendeesFile !== 'undefined')
              return this._data.attendeesFile;
            else 
              return [];
          },
          set : function(data) {
            
            this._data.attendeesFile = data;
            this.save();

          }
      },
      timelineChannels : {
          get : function() {
            if(typeof this._data.timeline.channels !== 'undefined') {
              var o = this._data.timeline.channels;
              
              for(i in o) {
                var qr = 'off';
                if(o[i].qr) {
                  qr = 'on';
                }
                if(o[i].id.indexOf('Hue ')==0) {
                  o[i].content = '<i data-channel="'+o[i].id+'" data-type="hue" class="channel-marker fa fa-lightbulb"></i> '+o[i].id;
                } else if(o[i].id.indexOf('Moodo ')==0) {
                  o[i].content = '<i data-channel="'+o[i].id+'" data-type="moodo" class="channel-marker fa fa-wind"></i> '+o[i].id;
                } else {
                  o[i].content = '<i data-channel="'+o[i].id+'" data-type="device" class="channel-marker fa fa-bullseye"></i> '+o[i].id+'<a href="#" title="Show QR code on this screen when not live" class="btn btn-sm btn-preroll-qr qr-'+qr+'" data-id="'+o[i].id+'"><i class="fa fa-qrcode"></i></a>';
                }

                
                if(o[i].id.toLowerCase().indexOf('local')==0) {
                  // add new window link for local targets
                  o[i].content += '<a class="btn btn-sm btn-open-local" data-id="'+o[i].id+'"><i class="fa fa-external-link-alt"></i></a>';
                }
                o[i].content += '<a class="btn btn-sm btn-mute" data-mute="off" data-id="'+o[i].id+'"><i class="text-success fa fa-volume-up"></i></a>';

              }
              return o;
            } else 
              return [];
          },
          set : function(data) {
            this._data.timeline.channels = data;
            this.save();
          }
      },
      startTime : {
          get : function() {
            return this._data.timeline.options.start
          },
          set : function(date) {
            this._data.timeline.options.start = date;
            this.save();
          }
      },
      endTime : {
          get : function() {
            return this._data.timeline.options.end;
          },
          set : function(date) {
            this._data.timeline.options.end = date;
            this.save();
          }
      },
      name : {
          get : function() {
            return this._data.name
          },
          set : function(name) {
            this._data.name = name;
            document.title = name +' - AtmOS';
            $('.project-name').html(name);
            if(this._data.venue != '') $('.project-name').html($('.project-name').html()+' <small>'+this._data.venue+'</small>')
            this.save();
          }
      },
      targets : {
          get : function() {
            return this._data.timeline.channels;
          },
          set : function (data) {
            this._data.timeline.channels = data;
            this.save();
          }
      },
      actions : {
          get : function() {
            return this._data.actions;
          },
          set : function(data) {
            this._data.actions = data;
            this.save();
          }          
      },
      checkinEvents : {
          get : function() {
            return this._data.checkinEvents;
          },
          set : function(data) {
            this._data.checkinEvents = data;
            this.save();
          }          
      },
      conditionals : {
          get : function() {
            return this._data.conditionals;
          },
          set : function(data) {
            this._data.conditionals = data;
            this.save();
          }          
      },
      accumulators : {
          get : function() {
            return this._data.accumulators;
          },
          set : function(data) {
            this._data.accumulators = data;
            this.save();
          }          
      },
      cueboardItems : {
          get : function() {
            return this._data.cueboardItems;
          },
          set : function(data) {
            this._data.cueboardItems = data;
            this.save();
          }          
      },
      fullData : {
          get : function() {
            return this._data
          },
          set : function(data) {
            this._data = data;
            this.save();
          }
      },
      currentParentItemID : {
          get : function() {
            return this._currentParentItemID;
          },
          set : function(data) {
            this._currentParentItemID = data;
          }
      },
      getSavedProjects: {
        get : function() {
          var i = 1;
          var list = [];
          for(i=1;i<=50;i++) {
            var data = localStorage.getItem('atmosProject_'+i);
            if(data!=''&&data!=null) {
              data = JSON.parse(data);
              
              list[i] = data.name;
            }
          }
          console.log(list);
          return list;
        }
      },
      dumpSavedProjects: {
        get : function() {
          var i = 1;
          var list = [];
          for(i=1;i<=50;i++) {
            var data = localStorage.getItem('atmosProject_'+i);
            if(data!=''&&data!=null) {
              data = JSON.parse(data);
              
              list[i] = data;
            }
          }
          console.log(list);
          // return list;
        }
      },
      settings : {
          get : function() {
            return {
              'name':this._data.name,
              'venue':this._data.venue,
              'webcam':this._data.webcam,
              'start':this._data.timeline.options.start,
              'end':this._data.timeline.options.end
            }
          },
          set : function(newData) {
            for(i in newData) {
              if(i == 'start' || i =='end') {
                this._data.timeline.options[i] = newData[i];
              } else {
                this._data[i] = newData[i];
              }
            }
            this.save();
          }
      }
  });

  /**
   * Asynchronously loads the JSON at the provided url, replacing any existing data.
   * @param {Object} url The url to be processed.
   * @returns {Promise} a promise that will resolve when the JSON is loaded.
   */
  atmosProject.prototype.load = function(id) {
      var data = localStorage.getItem('atmosProject_'+id);

      if(data!='') {
        data = JSON.parse(data);
        this._data = data;
        this._id = id;
        console.log('Loaded data from '+this._id);
        this.name = this._data.name; // trigger associated events like renaming page
        
        // clean up null items
        clean = true;
        for(i in this._data.timeline.items) {
          if(this._data.timeline.items[i]==null) {
            clean = false;
            break;
          }
        }
        if(!clean) {
          var newItems = [];
          for(i in this._data.timeline.items) {
            if(this._data.timeline.items[i]!=null) {
              newItems.push(this._data.timeline.items[i]);
            }
          }
          this._data.timeline.items = newItems;
          this.save();
        }
        console.log(this._data);
      }
  };
  atmosProject.prototype.save = function() {
      console.log('in project.save');
      if(this._id==0) {
        // find next available id
        var nextID = 1;
        while(localStorage.getItem('atmosProject_'+nextID)!=null) nextID++;
        this._id = nextID;  
      }
      localStorage.setItem('atmosProject_'+this._id,JSON.stringify(this._data));
      // save backup
      // localStorage.setItem('atmosProject_backup',JSON.stringify(this._data));

      console.log('Data saved to slot '+this._id);
      localStorage.setItem('atmosProject_lastID',this._id);
  };
  atmosProject.prototype.newTarget = function(id) {
      if(id=='') return false;
      // make sure it's not used
      var valid = true;
      for(i in this._data.timeline.channels) {
        if(this._data.timeline.channels[i].id==id) {
          valid = false;
          return false;
        }
      }
      if(valid) {
        this._data.timeline.channels.push({
          'id':id,
          'content':id
        });
        this.save();
        return true;
      } else return false;
      console.log('Data saved');
  };
  atmosProject.prototype.deleteTarget = function(id) {
      console.log('deleting '+id);
      if(id=='') return false;
      var newChannels = [];
      for(i in this._data.timeline.channels) {
        if(this._data.timeline.channels[i].id!=id) newChannels.push(this._data.timeline.channels[i]);
      }
      var newItems = [];
      for(i in this._data.timeline.items) {
        if(id!=this._data.timeline.items[i].group) newItems.push(this._data.timeline.items[i]);
      }
      this._data.timeline.channels = newChannels;
      this._data.timeline.items = newItems;
      this.save();
      return true;
  };

  atmosProject.prototype.renameTarget = function(id,oldID) {
      if(id==''||oldID=='') return false;
      if(id.toLowerCase().indexOf('hue ')==0) {
        alert('IDs beginning with "Hue" are reserved for Hue devices.');
        return false;
      }
      // make sure it's not used
      var valid = true;
      for(i in this._data.timeline.channels) {
        if(this._data.timeline.channels[i].id==id) {
          valid = false;
          return false;
        }
      }
      // now update any references to this target in the timeline
      for(i in this._data.timeline.channels) {
        if(this._data.timeline.channels[i].id==oldID) {
          this._data.timeline.channels[i] = {
            "id":id,
            "content":id
          };
        }
      }
      for(i in this._data.timeline.items) {
        if(oldID==this._data.timeline.items[i].group) this._data.timeline.items[i].group=id;
      }
      this.save();
      return true;
  };

  atmosProject.prototype.getAction = function(id) {
      
      if(id=='') return false;
      if(typeof this._data.actions === 'undefined') {
        return false;
      } else {
        if(typeof this._data.actions[id] === 'undefined') {
          return false;
        } else {
          if(this._data.actions[id].type=='video') {
            this._data.actions[id].icon = '<i class="fa fa-camera"></i>';
          } else if (this._data.actions[id].type=='text') {
            this._data.actions[id].icon = '<i class="fa fa-check"></i>';
          }
          return this._data.actions[id];
        }
      }
      return true;
  };
  atmosProject.prototype.renameAction = function(id,newID) {
      
      if(typeof this._data.actions[newID]!=='undefined') {
        return false;
      }
      
      // rename all timeline items assigned to this action 
      for(i in this._data.timeline.items) {
        if(this._data.timeline.items[i].actionID==id) {
          this._data.timeline.items[i].content=newID;
          this._data.timeline.items[i].actionID=newID;
        }
      }

      // now rename the action itself
      this._data.actions[newID] = this._data.actions[id];
      delete this._data.actions[id];

      this.save();
      return true;
  };
  atmosProject.prototype.addAction = function(data) {
      var newID = data.id;
      if(newID=='') return false;
      if(typeof this._data.actions[newID]!=='undefined') {
        return false;
      }
      
      this._data.actions[newID] = data;
      this.save();
      return true;
  };
  atmosProject.prototype.deleteAction = function(id) {
      
      if(id=='') return false;
      if(typeof this._data.actions === 'undefined') {
        return false;
      } else {
        if(typeof this._data.actions[id] === 'undefined') {
          return false;
        } else {
          delete this._data.actions[id];
        }
      }

      // now delete all timeline items assigned to this action
      var newItems = [];
      for(i in this._data.timeline.items) {
        if(this._data.timeline.items[i].content!=id) {
          newItems.push(this._data.timeline.items[i]);
        }
      }
      this._data.timeline.items = newItems;

      // same for movie timeline
      if(typeof this._data.movie !== 'undefined' && typeof this._data.movie.items !== 'undefined') {
        var newMovieItems = [];
        for(i in this._data.movie.items) {
          if(this._data.movie.items[i].content!=id) {
            newItems.push(this._data.movie.items[i]);
          }
        }
        this._data.movie.items = newMovieItems;   
      }

  };
  atmosProject.prototype.getItemAction = function(itemID,isCue) {
    if(typeof isCue === 'undefined') isCue = false;
    if(itemID==''||!itemID) return false;
    if(isCue) {

    } else {
      var me = false;
      for(i in this._data.timeline.items) {
        if(this._data.timeline.items[i].id==itemID) {
          var me = this._data.timeline.items[i];
          break;
        }
      }
      if(!me) return false;
      var actionID = me.content;
      if(typeof this._data.actions[actionID] !== 'undefined') {
        return this._data.actions[actionID];
      } else {
        return false;
      }
    }
  }

  atmosProject.prototype.getItem = function(id) {
    if(id=='') return false;
 
    // okay, look in main timeline
    var match = false;
    for(i in this._data.timeline.items) {
      if(this._data.timeline.items[i].id==id) {
        var mI = this._data.timeline.items[i];
        match = true;
        break;
      }
    }
    if(!match) return false;
    return mI;
    
  }  
  atmosProject.prototype.updateItem = function(data) {
   
    for(i in this._data.timeline.items) {
      if(this._data.timeline.items[i].id==data.id) {
        this._data.timeline.items[i]=data;
        break;
      }

    }
    this.save();
    
  }
  atmosProject.prototype.addItem = function(data) {
    console.log(data);
    this._data.timeline.items.push(data);
    this.save();
    
  }
  atmosProject.prototype.getCheckinEvent = function(id) {
    var ce = {};
    for(i in this._data.checkinEvents) {
      if(this._data.checkinEvents[i].id==id) {
        ce = this._data.checkinEvents[i];
        break;
      }
    }
    return ce;
    
  }
  atmosProject.prototype.setCheckinEvent = function(id,data) {
    var exists = false;
    for(i in this._data.checkinEvents) {
      if(this._data.checkinEvents[i].id==id) {
        this._data.checkinEvents[i] = data;
        exists = true;
        break;
      }
    }
    if(!exists) {
      this._data.checkinEvents.push(data);
      console.log('New entry for '+id);
    }
    this.save();
    
  }
  atmosProject.prototype.getConditional = function(id) {
    var ct = {};
    for(i in this._data.conditionals) {
      if(this._data.conditionals[i].id==id) {
        ct = this._data.conditionals[i];
        break;
      }
    }
    return ct;
    
  }
  atmosProject.prototype.setConditional = function(id,data) {
    var exists = false;
    for(i in this._data.conditionals) {
      if(this._data.conditionals[i].id==id) {
        this._data.conditionals[i] = data;
        exists = true;
        break;
      }
    }
    if(!exists) {
      this._data.conditionals.push(data);
      console.log('New entry for '+id);
    }
    this.save();
    
  }
  atmosProject.prototype.getAccumulator = function(id) {
    var a= {};
    for(i in this._data.accumulators) {
      if(this._data.accumulators[i].id==id) {
        a= this._data.accumulators[i];
        break;
      }
    }
    return a;
    
  }
  atmosProject.prototype.setAccumulator = function(id,data) {
    var exists = false;
    for(i in this._data.accumulators) {
      if(this._data.accumulators[i].id==id) {
        this._data.accumulators[i] = data;
        exists = true;
        break;
      }
    }
    if(!exists) {
      this._data.accumulators.push(data);
      console.log('New entry for '+id);
    }
    this.save();
    
  }
  atmosProject.prototype.getCueboardItem = function(id) {
    var cb = {};
    for(i in this._data.cueboardItems) {
      if(this._data.cueboardItems[i].id==id) {
        cb = this._data.cueboardItems[i];
        break;
      }
    }
    return cb;
    
  }
  atmosProject.prototype.setCueboardItem = function(id,data) {
    var exists = false;
    for(i in this._data.cueboardItems) {
      if(this._data.cueboardItems[i].id==id) {
        this._data.cueboardItems[i] = data;
        exists = true;
        break;
      }
    }
    if(!exists) {
      this._data.cueboardItems.push(data);
      console.log('New entry for '+id);
    }
    this.save();
    
  }  
  atmosProject.prototype.deleteItem = function(id) {
  
    var newItems = [];
   
    for(i in this._data.timeline.items) {
     
      if(this._data.timeline.items[i].id!=id) {
        newItems.push(this._data.timeline.items[i]);
      }
     
    }
    this._data.timeline.items = newItems;

    i
    this.save();
  }
 //  localStorage.setItem('atmosProject_lastID',null);
  project = new atmosProject(projectID);


  /*
  var newTI = [];
  for(i in timelineItems) {
    if(timelineItems[i].id.indexOf('c')==-1) {
      newTI.push(timelineItems[i]);
    }
  } 
  
  project.timelineItems = newTI;
  */
/*
  project.checkinEvents = [

   {
     "id":"10293721",
     "type":"match",
     "condition": {
         "field":"First name",
         "operator":"is",
         "value":"Sam"
     },
     "actionID":"3",
     "channel":"local2",
     "fadeIn":0,
     "fadeOut":0,
     "duration":5
   },
   {
     "id":"1283721",
     "type":"match",
     "condition": {
         "field":"First name",
         "operator":"isnot",
         "value":"Sam"
     },
     "actionID":"Spodermen",
     "channel":"local2",
     "fadeIn":0,
     "fadeOut":0,
     "duration":5
   },
   {
    "id":"1028371",
     "type":"error",
     "actionID":"Hue colour",
     "channel":"Hue color lamp 2",
      "color":"#ff0000",
      "fadeIn":0,
     "fadeOut":0,
     "duration":5
   }

  ]; */
  /* project.timelineChannels = [
  {
    'id':'snurry',
    'content':'snurry'
  },
  { 'id':'sparry',
    'content':'drizzle'

  }
  ]; */
  /* project.actions = {
    'action blue 1': {
      'id' : 'action blue 1',
      'type':'text',
      'text': {
        'headline':'Test headline',
        'color':'#ff0000',
        'bgcolor':'#000000',
        'font':'sans-serif',
        'additional':'',
        'additionalcolor':'',
        'additionalbgcolor':'',
        'additionalfont':''
      }
    },
    'action red 2': {
      'id':'action red 2',
      'type':'text',
      'text': {
        'headline':'Test headline 2',
        'color':'#00ff00',
        'bgcolor':'#0000ff',
        'font':'sans-serif',
        'additional':'',
        'additionalcolor':'',
        'additionalbgcolor':'',
        'additionalfont':''
      }
    }
  } */
  // project.startTime = '2019-10-09:12:00:00Z';
  // project.endTime = '2019-10-15:12:00:00Z';
  

  project.save();

  // set up targets and actions lists on front end
  var tOut = '';
  var p = project.targets;
  for(i in p) {
    tOut += ejs.render(front['target'],p[i]);
  }
  $('.targets-list').html(tOut);
  $(document).off('click','.add-target').on('click','.add-target',function(e){
    e.preventDefault();
    var id = $(this).parent().find('input').val();
    if(id!='') {
      var result = project.newTarget(id);
      if(result) document.location.reload();
      console.log(result);
    } else {
      alert('Name cannot be blank.');
    }
  });
  $(document).off('click','.btn-open-local').on('click','.btn-open-local',function(e){
    e.preventDefault();
    var url = "/screen/"+$(this).attr('data-id');
    if(typeof PresentationRequest !== 'undefined') {
      const presentationRequest = new PresentationRequest(url);
      presentationRequest.start()
      .then(connection => {
        console.log('Connected to ' + connection.url + ', id: ' + connection.id);
      })
      .catch(error => {
        console.log(error);
      });

    } else {
      // if the Presentation API is not available, just open in a new window
      window.open(url,url,'width=1000,500');
    }

    
  });
  $(document).off('click','.btn-preroll-qr').on('click','.btn-preroll-qr',function(e){
    
    e.preventDefault();
    var channelID = $(this).attr('data-id');
    var t = project.timelineChannels;

    var id = -1;
    for(var i=0;i<t.length;i++) {
      if(t[i].id==channelID) {
        id=i;
        break;
      }
    }

    if(id>0) {
     if($(this).hasClass('qr-on')) {
        $(this).removeClass('qr-on').addClass('qr-off');
        t[id].qr = false;
      } else {  
        $(this).removeClass('qr-off').addClass('qr-on');
        t[id].qr = true;
      }
         
      project.timelineChannels = t;
      sendTargetsToScreens();
    }



    
  });
  $(document).off('click','.rename-target').on('click','.rename-target',function(e){
    e.preventDefault();
    var id = $(this).parent().find('input').val();
    var oldID = $(this).parent().find('input').attr('data-oldID');
    if(id!='') {
      if(confirm("After a target is renamed, you'll need to manually update any media screen assigned this target name. Are you sure?")) {
        var result = project.renameTarget(id,oldID);
        if(result) document.location.reload();
        console.log(result);
      }
    } else {
      alert('Name cannot be blank.');
    }
  });
  $(document).off('click','.delete-target').on('click','.delete-target',function(e){
    e.preventDefault();
    var id = $(this).parent().find('input').attr('data-oldID');
    if(id!='') {
      if(confirm("After a target is deleted, all timeline actions connecting it to events will also be unavailable. Are you sure?")) {
        var result = project.deleteTarget(id);
        if(result) document.location.reload();
        console.log(result);
      }
    } 
  });
  $(document).off('click','.edit-action').on('click','.edit-action',function(e) {
    e.preventDefault();
    var id = $(this).attr('data-actionID');
    if(id!='') {
      var obj = project.getAction(id);
      var myType = obj.type;
      $('#actionTypeDetails').html(front['actionForm-'+myType]);
      if(myType=='video') {
        if(typeof obj.video !== 'undefined' &&  typeof obj.video.filename!=='undefined') {
          var sel = obj.video.filename;
        } else {
          var sel = false;
        }
        refreshFileDropdowns($('#actionForm [name="video-filename"]'),sel);
      } else {
        var sel = obj.text.font;
        refreshFileDropdowns($('#actionForm [name="text-font"]'),sel);
        sel = obj.text.additionalFont;
        refreshFileDropdowns($('#actionForm [name="text-additionalFont"]'),sel);
        sel = obj.text.image;
        refreshFileDropdowns($('#actionForm [name="text-image"]'),sel);
      }
      bindToForm($('#actionForm'),obj);
    }    
  });
  $(document).off('click','.delete-action').on('click','.delete-action',function(e) {
    e.preventDefault();
    var id = $(this).attr('data-actionID');
    if(id!='') {
      if(!confirm("Warning: deleting this action will also delete any references to it in the project. Are you sure?")) {
        return false;
      }
      var obj = project.getAction(id);
      
      var locations = [ 'checkinEvents','conditionals','cueboardItems','timelineItems' ];

      for(var i in locations) {
        var temp = [];
        var curr = project[ locations[i] ];
        for(var j in curr) {
          if(typeof curr[j].actionID !== 'undefined' && curr[j].actionID!=id) {
            temp.push(curr[j]);
          }
        }
        console.log('replacing '+locations[i]+' with',temp);
        project[ locations[i] ] = temp;
      }

      var a = project.actions;
      
      for(var i in a) {
        console.log(i);
        if(i==id||i==0) {
          delete a[i];
        }    
      }
    
      project.actions = a;
      // console.log(a);
      document.location.reload();

    }    
  });
  // set up targets and actions lists on front end
  var aOut = '';
  var adOut = '';
  var p = project.actions;
  if(p!={}) {
    for(i in p) {
      aOut += ejs.render(front['action'],p[i]);
      adOut += ejs.render(front['actionDraggable'],p[i]);
    }
  }
  adOut += front['hueActionsDraggable'];
  adOut += front['moodoActionsDraggable'];

  $('.actions-list').html(aOut);
  $('.items').html(adOut);

  bindToForm($('#projectSettingsForm'),project.fullData);



  function notifyHueButton() {
    alert('Please presss the button on your Hue Bridge to authorise remote control.')
  }
  function processColours(colours) {
    var date = new Date();
    var timestamp = date.getTime();

    colours.sort(function(x,y) {
      var sX = x[0]+x[1]+x[2];
      var sY = y[0]+y[1]+y[2];
      if(sX<sY) {
        return 1;
      }
      if(sX>sY) {
        return -1;
      }
      return 0;
    }) 

    for(i in colours) {


      var r = colours[i][0];
      var g = colours[i][1];
      var b = colours[i][2];

      var dR = r - oldColours[i][0];
      var dG = g - oldColours[i][0];
      var dB = b - oldColours[i][0];

      var dT = timestamp - oldColours[i][3];

      if (Math.abs(dR)>colourLimit && Math.abs(dG)>colourLimit && Math.abs(dB)>colourLimit && dT > timeLimit) {
            
        oldColours[i] = [r,g,b,timestamp];        
        $('#colourTester div:eq('+i+')').css({ 'background-color':'rgb('+r+','+g+','+b+')'});   
        
      }
    }
    // drop the two darkest and find the most interesting of the remaining three
    var bestIndex = -1;
    var diffMax = 0;
    for(i in colours) {
      var myDiff = 
          Math.max(
            Math.abs(colours[i][0] - colours[i][1]),
            Math.abs(colours[i][1] - colours[i][2]),
            Math.abs(colours[i][0] - colours[i][2])
          );
      if(myDiff>diffMax) {
        diffMax = myDiff;
        bestIndex = i;
      }
    }
    var hsv = rgb2hsv(colours[bestIndex][0],colours[bestIndex][1],colours[bestIndex][2]);
    if(hsv[2]>50) {
      var body = {
        "on":true,
        "sat":hsv[1],
        "bri":hsv[2],
        "hue":hsv[0]
      }
    } else {
      var body = {
        "on":false
      }
    }

    sendHue(connection,body,'!all');

  }


      $('.wsCommand').on('mousedown',function(e){
        e.preventDefault();
        if($(this).attr('data-ws-command')=='flash') {
          if(typeof connection !== 'undefined') {
            flashAll(connection,'MASTER');
          }
        }
        
      });
      $('.phCommand').on('mousedown',function(e){
        e.preventDefault();
        if($(this).attr('data-ph-command')=='flash') {
          if(typeof connection !== 'undefined') {
            flashHueAll(connection,'MASTER');
          }
        }
        
      });
      $('.mdCommand').on('mousedown',function(e){
        e.preventDefault();
        if($(this).attr('data-md-command')=='flash') {
          if(typeof connection !== 'undefined') {
            flashMoodoAll(connection,'MASTER');
          }
        }
        
      });
      status = 'ready';
      // ESTABILSH CONNECTION WITH WEBSOCKET SERVER AS MASTER
      lastPing = Date.now();


      window.WebSocket = window.WebSocket || window.MozWebSocket;
      // if browser doesn't support WebSocket, just show
      // some notification and exit
      if (!window.WebSocket) {
        alert('Sorry, but your browser doesn\'t support WebSocket.');
        
      }

      function sendTargetsToScreens() {
        var t = project.targets;
        var tCopy = {...t};
        for(i in tCopy) {
          if(tCopy[i].id.toLowerCase().indexOf('hue ')>-1 || tCopy[i].id.toLowerCase().indexOf('moodo ')>-1) delete tCopy[i];
        }
        console.log(tCopy);
        sendTargets(connection,'MASTER',tCopy);
      }

      var oldColours = [];
      var date = new Date();
  	  var timestamp = date.getTime();
  	  var timeLimit = 200; // msecs to 'lock' a given colour for
  	  var colourLimit = 10;
      oldColours[0] = [0,0,0,timestamp];
      oldColours[1] = [0,0,0,timestamp];
      oldColours[2] = [0,0,0,timestamp];
      oldColours[3] = [0,0,0,timestamp];
      oldColours[4] = [0,0,0,timestamp];

      // open connection
      const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
      const echoSocketUrl = socketProtocol + '//' + window.location.hostname + ':1337/?alias=MASTER';
      connection = new WebSocket(echoSocketUrl);
      connection.onopen = function () {
        console.log('connection made. Sending project data to server');
        updateProject(connection,project.fullData);

        // start heartbeat
        window.setInterval(function(){
          sendHeartbeat(connection,'MASTER',status);
        },4000);

        // send list of targets currently in project
        console.log('sending ');
        sendTargetsToScreens();

      };
      connection.onerror = function (error) {
        // just in there were some problems with connection...
        console.log('Sorry, but there\'s some problem with your connection or the server is down.');
      };

      // most important part - incoming messages
      connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server
        // always returns JSON this should work without any problem but
        // we should make sure that the massage is not chunked or
        // otherwise damaged.
        var data = JSON.parse(message.data);
        if(data.command=='probe') {
          // heartbeat from server
          lastPing = Date.now();
          console.log('PING: '+lastPing);
        } else if (data.command=='manifest_response') {
            // alert('Got manifest response');
            var htmlActive = '';
            var htmlReady = '';
            var countActive = 0;
            var countReady = 0;
            for(i in data.manifest) {
              if(data.manifest[i].alias!='MASTER') {
                if(data.manifest[i].status=='ready') {
                  htmlReady += ejs.render(front['device-list-item-ready'],data.manifest[i]);
                  countReady++;
                } else {
                  htmlActive += ejs.render(front['device-list-item-active'],data.manifest[i]);
                  countActive++; 
                }
              }
              
            }
            devices = data.manifest;
            $('.device-list-active').html(htmlActive);
            $('.device-list-ready').html(htmlReady);
            $('.device-list-active-number').html('('+countActive+')');
            $('.device-list-ready-number').html('('+countReady+')');
            if(countActive==0) {
              $('.device-list-header-active').hide();
              $('#collapseScreens hr.sidebar-divider:eq(0)').hide();
            } else {
              $('.device-list-header-active').show();
              $('#collapseScreens hr.sidebar-divider:eq(0)').show();
            }
            if(countReady==0) {
              $('.device-list-header-ready').hide();
              $('#collapseScreens hr.sidebar-divider:eq(1)').hide();
            } else {
              $('.device-list-header-ready').show();
              $('#collapseScreens hr.sidebar-divider:eq(1)').show();
            }
            $('.badge-counter-devices').html(countReady+countActive);
        } else if (data.command=='hue_manifest_response') {
            console.log(data);
            var htmlActive = '';
            var htmlReady = '';
            var countActive = 0;
            var countReady = 0;
            hueDevices = data.manifest;
            var t = project.timelineChannels;

            for(i in data.manifest) {
              
              if(data.manifest[i].alias!='MASTER') {
                if(data.manifest[i].status=='ready') {
                  
                  var myAlias = data.manifest[i];
                  htmlReady += ejs.render(front['device-list-item-ready'],{ 'alias': myAlias });
                  countReady++;
                } else {
                  var myAlias = data.manifest[i];
                  data.manifest[i].alias = data.manifest[i];
                  
                  alreadyPresent = false;
                  for(j in t) {
                    if(t[j].id==myAlias) {
                      alreadyPresent = true;
                      break;
                    } 
                  }
                  if(!alreadyPresent) {

                      // not present, add
                      t.push({
                        'id':myAlias,
                        'content':'<i data-channel="'+myAlias+'" data-type="device" class="channel-marker fa fa-lightbulb"></i> '+myAlias
                      });
                    
                  }
                  htmlActive += ejs.render(front['device-list-item-active'],{ 'alias': myAlias });
                  countActive++; 
                  
                }
              }
              
            }
            project.timelineChannels = t;

            channels.update(t);
            timeline.redraw();
             //      }
            $('.iot-list-active').html(htmlActive);
            $('.iot-list-ready').html(htmlReady);
            $('.iot-list-active-number').html('('+countActive+')');
            $('.iot-list-ready-number').html('('+countReady+')');
            if(countActive==0) {
              $('.iot-list-header-active').hide();
              $('#collapseIOT hr.sidebar-divider:eq(0)').hide();
            } else {
              $('.iot-list-header-active').show();
              $('#collapseIOT hr.sidebar-divider:eq(0)').show();
            }
            if(countReady==0) {
              $('.iot-list-header-ready').hide();
              $('#collapseIOT hr.sidebar-divider:eq(1)').hide();
            } else {
              $('.iot-list-header-ready').show();
              $('#collapseIOT hr.sidebar-divider:eq(1)').show();
            }
            $('.badge-counter-iot').html(countReady+countActive);


        } else if (data.command=='moodo_refresh') {
            console.log(data);
            var htmlActive = '';
            var htmlReady = '';
            var countActive = 0;
            var countReady = 0;
            moodoDevices = data.boxes;
            project.moodoDevices = moodoDevices;
            var t = project.timelineChannels;

            for(i in data.boxes) {
              
              var myAlias = data.boxes[i].name;
              
              alreadyPresent = false;
              for(j in t) {
                if(t[j].id==myAlias) {
                  alreadyPresent = true;
                  break;
                } 
              }
              if(!alreadyPresent) {

                  // not present, add
                  t.push({
                    'id':myAlias,
                    'content':'<i data-channel="'+myAlias+'" data-type="device" class="channel-marker fa fa-wind"></i> '+myAlias
                  });
                
              }
              htmlActive += ejs.render(front['device-list-item-active'],{ 'alias': myAlias });
              countActive++; 
                
              
              
            }
            project.timelineChannels = t;

            channels.update(t);
            timeline.redraw();
             //      }
            $('.moodo-list-active').html(htmlActive);
            $('.moodo-list-active-number').html('('+countActive+')');
            $('.moodo-list-ready-number').html('('+countReady+')');
            if(countActive==0) {
              $('.moodo-list-header-active').hide();
              $('#collapseMOODO hr.sidebar-divider:eq(0)').hide();
            } else {
              $('.moodo-list-header-active').show();
              $('#collapseMOODO hr.sidebar-divider:eq(0)').show();
            }
            
            $('.badge-counter-moodo').html(countActive);


        } else if (data.command=='colours') {
        	 // incoming key colours
        	 var date = new Date();
	  		   var timestamp = date.getTime();      	
           processColours(data.colours);
        } else if (data.command=='hue_press_button') {
           notifyHueButton();
        } else if (data.command=='haltLive') {
           $('body').removeClass('live');
        }
        
        
      };

      /**
       * This method is optional. If the server wasn't able to
       * respond to the in 3 seconds then show some error message 
       * to notify the user that something is wrong.
       */
      sentry = window.setInterval(function() {
        if (connection.readyState !== 1) {
          console.log('Unable to communicate with the WebSocket server. Please restart the server, then reload this page.');
          window.clearInterval(sentry);
        }
      }, 3000);



      // wcInitScan();
      $('.wcRescan').click(function(e){

        e.preventDefault();
        wcInitScan();
      });
      




 });
    /* alasql('CREATE localStorage DATABASE IF NOT EXISTS atmos');
    alasql('ATTACH localStorage DATABASE atmos AS myAtmos');
    // alasql('CREATE TABLE IF NOT EXISTS myAtmos.city (cityID number AUTO_INCREMENT, city string, population number, CONSTRAINT cpk PRIMARY KEY (cityID))');
    alasql('SELECT * INTO myAtmos.city FROM ?',[[
        {
          'city':'Beardsville',
          'population':1000
        },
        {
          'city':'Allsville',
          'population':2011
        }

      ]]);
    var res = alasql('SELECT * FROM myAtmos.city WHERE cityID>3');
    console.log(res); */
