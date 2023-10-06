var front = new Array();

front['statusItem'] = `
<a class="dropdown-item d-flex align-items-center" href="#">
                  <div class="mr-3">
                    <div class="icon-circle bg-success">
                      <i class="fas fa-check text-white"></i>
                    </div>
                  </div>
                  <div>
                    <div class="small text-gray-500">Running on 192.168.2.1:3000</div>
                    Web server online
                  </div>
                </a>`;
front['device-list-item-ready'] = `<a class="text-warning collapse-item device-list-item" data-alias="<%= alias %>" href="#"><strong><%= alias %></strong></a>
`;
front['device-list-item-active'] = `<a class="text-success collapse-item device-list-item" data-alias="<%= alias %>" href="#"><strong><%= alias %></strong></a>
`;          
front['target'] =`<div class="input-group input-group-sm">
                    <input type="text" name="existing-target" class="form-control form-control-sm" data-oldID="<%= id %>" value="<%= id %>" placeholder="Name" <% if(id.toLowerCase().indexOf('hue ')==0 || id.toLowerCase().indexOf('moodo ')==0)  { %>disabled="disabled" <% } %>>
                    <% if(id.toLowerCase().indexOf('hue ')!=0 && id.toLowerCase().indexOf('moodo ')!=0) { %><div class="input-group-append delete-target">
                      <span class="input-group-text"><small><i class="fa fa-times"></i></small></span>
                    </div>
                    <div class="input-group-append rename-target">
                      <span class="input-group-text"><small><i class="fa fa-check"></i></small></span>
                    </div><% } %>
                  </div>`;
front['action'] = `
              <div class="actionHolder">
                <a class="collapse-item edit-action" data-actionID="<%= id %>" data-toggle="modal" data-target="#actionsModal" href="#"><span class="itemGubbins"><i class="far fa fa-<% if(type=='video') { %>film<% } else { %>newspaper<% } %>"></i></span> <%= id %></a>
                    <a class="delete-action" href="#" data-actionID="<%= id %>" >
                      <small><i class="fa fa-times"></i></small>
                    </a>
                   
                  </div>
              `;



front['actionDraggable'] = `<li draggable="true" class="item" data-type="device" data-actionID="<%= id %>"><span class="itemGubbins"><i class="far fa fa-<% if(type=='video') { %>film<% } else { %>newspaper<% } %>"></i></span> <%= id %></li>`;
/* front['conditionalBranch'] = `
<li draggable="true" class="item" data-type="logic" data-actionID="Conditional branch"><span class="itemGubbins"><i class="far fa fa-square-root-alt"></i></span> Conditional branch</li>`;
*/
front['hueActionsDraggable'] = `
<li draggable="true" class="item" data-type="hue" data-actionID="Hue colour"><span class="itemGubbins"><i class="far fa fa-palette"></i></span> Hue colour</li>
<li draggable="true" class="item" data-type="hue" data-actionID="Hue on"><span class="itemGubbins"><i class="far fa fa-power-off"></i></span> Hue off/on</li>`;

front['moodoActionsDraggable'] = `
<li draggable="true" class="item" data-type="moodo" data-actionID="Moodo"><span class="itemGubbins"><i class="far fa fa-wind"></i></span> Moodo</li>`;



front['actionForm-text'] = `
        <fieldset><legend>Main Text</legend>
                <div class="form-group">
                      <label>Headline</label>
                      <input type="text" name="text-headline" class="bind bindAction form-control" placeholder="">
                    </div>
                <div class="row">
                  <div class="col">

                    <div class="form-group">
                      <label>Colour</label>
                      <div class="input-group">
                        
                        <input type="color" name="text-color" value="" class="color bind bindAction form-control" placeholder="">
                        <div class="input-group-append">
                          <span class="input-group-text">&nbsp;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="form-group">
                      <label>Background colour</label>
                      <div class="input-group">
                        
                        <input type="color" name="text-bgcolor" value="" class="color bind bindAction form-control" placeholder="">
                        <div class="input-group-append">
                          <span class="input-group-text">&nbsp;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                      <label>Font</label>
                      <div class="input-group">
                        <select class="form-control bind bindProject" name="text-font" data-folder="fonts">
                          <option value="sans-serif">Helvetica/Arial</option>
                          <option value="serif">Times</option>
                          <option value="monotype">Courier</option>
                        </select>
                          <div class="input-group-append refresh-font-list" data-folder="fonts">
                            <span class="input-group-text"><i class="fa fa-sync-alt"></i></span>
                          </div>
                      </div>
                  </div>
                </div>

            </fieldset>

            <fieldset>
              <legend>Additional Text</legend>
                <div class="form-group">
                      <label>Text</label>
                      <input type="text" name="text-additional" value=""  class="bind bindAction form-control" placeholder="">
                    </div>
                <div class="row">
                  <div class="col">
                    <div class="form-group">
                      <label>Colour</label>
                      <div class="input-group">
                        
                        <input type="color" name="text-additionalcolor" value=""  class="color bind bindAction form-control" placeholder="">
                        <div class="input-group-append">
                          <span class="input-group-text">&nbsp;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                 
                  <div class="col">
                      <label>Font</label>
                      <div class="input-group">
                        <select class="form-control bind bindProject" name="text-additionalFont" data-folder="fonts">
                          <option value="sans-serif">Helvetica/Arial</option>
                          <option value="serif">Times</option>
                          <option value="monotype">Courier</option>
                        </select>
                          <div class="input-group-append refresh-font-list" data-folder="fonts">
                            <span class="input-group-text"><i class="fa fa-sync-alt"></i></span>
                          </div>
                      </div>
                  </div>
                </div>
                
             
            </fieldset>

            <fieldset>
              <legend>Background image</legend>
              
                <div class="form-group">
                      <label>Select file</label>
                      <div class="input-group">
                        <select class="form-control bind bindProject file-list" data-folder="images" name="text-image">
                         
                        </select>
                         <div class="input-group-append refresh-image-list" data-folder="images">
                          <span class="input-group-text"><i class="fa fa-sync-alt"></i></span>
                        </div>
                      </div>
               
                </div>
             
            </fieldset>
                `;
front['actionForm-video'] = `
<fieldset><legend>Video</legend>

                <div id="hiddenVideo">
                  <video></video>
                </div>
                <input type="hidden" class="bind" name="video-duration" />
                <div class="form-group">
                      <label>Select file</label>
                      <div class="input-group">
                        <select class="form-control bind bindProject file-list" data-folder="video" name="video-filename">
                          
                        </select>
                         <div class="input-group-append refresh-video-list" data-folder="video">
                          <span class="input-group-text"><i class="fa fa-sync-alt"></i></span>
                        </div>
                      </div>
               
                </div>
           

               
                </fieldset>
                `;
front['checkin-event'] = `<form class="form-inline checkinForm">
          <input type="hidden" name="id" class="bind" value="<%= data.id %>" />
          <label class="small mr">When a</label>
            <div class="input-group input-group-sm">
              <select class="bind form-control" name="type">
                  <option value="match" <% if(typeof data.type !== 'undefined' && data.type=='match') { %>selected="selected" <% } %>>guest checks in</option>
                  <option value="error" <% if(typeof data.type !== 'undefined' && data.type=='error') { %>selected="selected" <% } %>>code doesn't match</option>
                </select>
            </div>
          <label class="small mb">and</label>      
          <div class="input-group input-group-sm">
              <input class="bind form-control" placeholder="any" name="condition-field" value="<% if(typeof data.condition !== 'undefined') { %><%=data.condition.field %><% } %>" />
            </div>
          <label class="small mb">field</label>
          <div class="input-group input-group-sm">
              <select class="bind form-control" name="condition-operator">
                  <option value="is" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='is') { %>selected="selected" <% } %>>is</option>
                  <option value="isnot" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='isnot') { %>selected="selected" <% } %>>is not</option>
                  <option value="contains" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='contains') { %>selected="selected" <% } %>>contains</option>
                  <option value="doesnotcontain" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='doesnotcontain') { %>selected="selected" <% } %>>doesn't contain</option>
                  <option value="isatleast" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='isatleast') { %>selected="selected" <% } %>>is at least</option>
                  <option value="isatmost" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='isatmost') { %>selected="selected" <% } %>>is at most</option>
                </select>
            </div>
            <div class="ml input-group input-group-sm">
              <input class="bind form-control" placeholder="any value" name="condition-value" value="<% if(typeof data.condition !== 'undefined') { %><%=data.condition.value %><% } %>" />
            </div>
        

          
              
              <label class="mb small"><i class="fa fa-arrow-right"></i> &nbsp; &nbsp;show</label>
              <div class="input-group input-group-sm">
                <select class="bind form-control" name="actionID">
                    <option value=""></option>
                    <% for(i in actions) { %>
                      <option value="<%= actions[i].id %>" <% if(typeof data.actionID !== 'undefined' && data.actionID==actions[i].id) { %> selected="selected" <% } %>><%= actions[i].id %></option>
                    <% } %>
                  </select>
              </div>
              <label class="mb small">on</label>
              <div class="input-group input-group-sm">
                <select class="bind form-control" name="channel">
                    <option value=""></option>
                    <% for(i in channels) { %>
                      <option value="<%= channels[i].id %>" <% if(typeof data.channel !== 'undefined' && data.channel==channels[i].id) { %> selected="selected" <% } %>><%= channels[i].id %></option>
                    <% } %>
                  </select>
              </div>
              <div class="input-group">
                <button class="btn-checkinEventDelete mb btn btn-sm btn-danger"><i class="fa fa-times"></i></button>
                <button class="btn-checkinEventSettings btn btn-sm btn-secondary" data-id="<%= data.id %>"><i class="fa fa-arrow-right"></i> Settings</button>
              </div>
           
      </form>`;

front['cueboard-item'] = `<form class="form-inline cueboardForm">
          <input type="hidden" name="id" class="bind" value="<%= data.id %>" />
            
            <div class="input-group input-group-sm">
              <input class="bind form-control" placeholder="hot key" name="hotkey" value="<% if(typeof data.hotkey !== 'undefined') { %><%=data.hotkey %><% } %>" />
            </div>
        

          
              
              <label class="mb small"><i class="fa fa-arrow-right"></i> &nbsp; &nbsp;show</label>
              <div class="input-group input-group-sm">
                <select class="bind form-control" name="actionID">
                    <option value=""></option>
                    <% for(i in actions) { %>
                      <option value="<%= actions[i].id %>" <% if(typeof data.actionID !== 'undefined' && data.actionID==actions[i].id) { %> selected="selected" <% } %>><%= actions[i].id %></option>
                    <% } %>
                    <option value="Screen off" <% if(typeof data.actionID !== 'undefined' && data.actionID=='Screen off') { %> selected="selected" <% } %>>Screen off</option>
                    <option value="Hue off" <% if(typeof data.actionID !== 'undefined' && data.actionID=='Hue off') { %> selected="selected" <% } %>>Hue off</option>
                    <option value="Moodo off" <% if(typeof data.actionID !== 'undefined' && data.actionID=='Moodo off') { %> selected="selected" <% } %>>Moodo off</option>
                  </select>
              </div>
              <label class="mb small">on</label>
              <div class="input-group input-group-sm">
                <select class="bind form-control" name="channel">
                    <option value=""></option>
                    <% for(i in channels) { %>
                      <option value="<%= channels[i].id %>" <% if(typeof data.channel !== 'undefined' && data.channel==channels[i].id) { %> selected="selected" <% } %>><%= channels[i].id %></option>
                    <% } %>
                  </select>
              </div>
              <div class="input-group">
                <button class="btn-cueboardItemDelete mb btn btn-sm btn-danger"><i class="fa fa-times"></i></button>
                <button class="btn-cueboardItemSettings btn btn-sm btn-secondary" data-id="<%= data.id %>"><i class="fa fa-arrow-right"></i> Settings</button>
              </div>
           
      </form>`;
front['conditional-trigger'] = `<form class="form-inline conditionalForm">
          <input type="hidden" name="id" class="bind" value="<%= data.id %>" />
          <label class="small mr">When</label>
            <div class="input-group input-group-sm">
              <select class="bind form-control" name="variable">
                    <% for(i in accumulators) { %>
                      <option value="<%= accumulators[i].name %>" <% if(typeof data.variable !== 'undefined' && data.variable==accumulators[i].name) { %> selected="selected" <% } %>><%= accumulators[i].name %></option>
                    <% } %>
                    <option value="ctChecked" <% if(typeof data.variable !== 'undefined' && data.variable=='ctChecked') { %> selected="selected" <% } %>>Check in: quantity checked</option>
                    <option value="ctRemaining" <% if(typeof data.variable !== 'undefined' && data.variable=='ctRemaining') { %> selected="selected" <% } %>>Check in: quantity remaining</option>
                    <option value="ctTotal" <% if(typeof data.variable !== 'undefined' && data.variable=='ctTotal') { %> selected="selected" <% } %>>Check in: quantity total</option>
              </select>
            </div>
          &nbsp;
            <div class="input-group input-group-sm">
              <select class="bind form-control" name="condition-operator">
                  <option value="is" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='is') { %>selected="selected" <% } %>>is</option>
                  <option value="isnot" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='isnot') { %>selected="selected" <% } %>>is not</option>
                  <option value="contains" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='contains') { %>selected="selected" <% } %>>contains</option>
                  <option value="doesnotcontain" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='doesnotcontain') { %>selected="selected" <% } %>>doesn't contain</option>
                  <option value="isatleast" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='isatleast') { %>selected="selected" <% } %>>is at least</option>
                  <option value="isatmost" <% if(typeof data.condition !== 'undefined' && data.condition.operator=='isatmost') { %>selected="selected" <% } %>>is at most</option>
                </select>
            </div>
            <div class="ml input-group input-group-sm">
              <input class="bind form-control" placeholder="any value" name="condition-value" value="<% if(typeof data.condition !== 'undefined') { %><%=data.condition.value %><% } %>" />
            </div>


          
              
              <label class="mb small"><i class="fa fa-arrow-right"></i> &nbsp; &nbsp;show</label>
              <div class="input-group input-group-sm">
                <select class="bind form-control" name="actionID">
                    <option value=""></option>
                    <% for(i in actions) { %>
                      <option value="<%= actions[i].id %>" <% if(typeof data.actionID !== 'undefined' && data.actionID==actions[i].id) { %> selected="selected" <% } %>><%= actions[i].id %></option>
                    <% } %>
                    <option value="Screen off" <% if(typeof data.actionID !== 'undefined' && data.actionID=='Screen off') { %> selected="selected" <% } %>>Screen off</option>
                    <option value="Hue off" <% if(typeof data.actionID !== 'undefined' && data.actionID=='Hue off') { %> selected="selected" <% } %>>Hue off</option>
                    <option value="Moodo off" <% if(typeof data.actionID !== 'undefined' && data.actionID=='Moodo off') { %> selected="selected" <% } %>>Moodo off</option>
                  </select>
              </div>
              <label class="mb small">on</label>
              <div class="input-group input-group-sm">
                <select class="bind form-control" name="channel">
                    <option value=""></option>
                    <% for(i in channels) { %>
                      <option value="<%= channels[i].id %>" <% if(typeof data.channel !== 'undefined' && data.channel==channels[i].id) { %> selected="selected" <% } %>><%= channels[i].id %></option>
                    <% } %>
                  </select>
              </div>
             <div class="ml input-group input-group-sm">
              <select class="bind form-control" name="mode">
                  <option value="once" <% if(typeof data.mode !== 'undefined' && data.mode=='once') { %>selected="selected" <% } %>>once</option>
                  <option value="persistent" <% if(typeof data.mode !== 'undefined' && data.mode=='persistent') { %>selected="selected" <% } %>>persistently</option>
                 </select>
            </div>
              <div class="input-group">
                <button class="btn-conditionalDelete mb btn btn-sm btn-danger"><i class="fa fa-times"></i></button>
                <button class="btn-conditionalSettings btn btn-sm btn-secondary" data-id="<%= data.id %>"><i class="fa fa-arrow-right"></i> Settings</button>
              </div>
           
      </form>`;

front['accumulator'] = `<div form class="form-inline accumulatorForm">
         <input type="hidden" name="id" class="bind" value="<%= data.id %>" />
            <div class="input-group input-group-sm">
              <input class="bind form-control" placeholder="name" name="name" value="<%= data.name %>" />
            </div>&nbsp;
            <div class="input-group input-group-sm">
              <select class="bind form-control" name="type">
                <option value="">- type -</option>
                <option value="counter" <% if(data.type=='counter'){ %>selected="selected"<% } %>>counter</option>
                <option value="textSingle" <% if(data.type=='textSingle'){ %>selected="selected"<% } %>>text (overwrite previous)</option>
                <option value="textMultiple" <% if(data.type=='textMultiple'){ %>selected="selected"<% } %>>text (multiple)</option>
              </select>
            </div>&nbsp;
            <div class="input-group input-group-sm">
              <input class="bind form-control" placeholder="Initial value" name="initVal" value="<%= data.initVal %>" />
            </div>&nbsp;
            <div class="input-group input-group-sm">
              <select class="bind form-control" name="restrict">
                <option value="restricted" <% if(data.restrict=='restricted'){ %>selected="selected"<% } %>>one submission per device</option>
                <option value="unrestricted" <% if(data.restrict=='unrestricted'){ %>selected="selected"<% } %>>unresistricted submission</option>
              </select>
            </div>&nbsp;
            <div class="input-group">
                <button class="btn-accumulatorDelete mb btn btn-sm btn-danger"><i class="fa fa-times"></i></button>
              </div>
       </div>`;
front['cueboard-live'] = `<div class="cueboardItem" data-hotkey="<%= data.hotkey %>" data-actionID="<%= data.actionID %>" data-channel="<%= data.channel %>" data-fadeIn="<% if(typeof data.fadeIn !== 'undefined' && data.fadeIn>0) { %><%= data.fadeIn %><% } else { %>0<% } %>" data-fadeOut="<% if(typeof data.fadeOut !== 'undefined' && data.fadeOut>0) { %><%= data.fadeOut %><% } else { %>0<% } %>" data-color="<% if(typeof data.color !== 'undefined') { %><%= data.color %><% } %>" 
  data-moodoSlot0="<% if(typeof data.moodoSlot0 !== 'undefined') { %><%= data.moodoSlot0 %><% } %>"
  data-moodoSlot1="<% if(typeof data.moodoSlot0 !== 'undefined') { %><%= data.moodoSlot1 %><% } %>"
  data-moodoSlot2="<% if(typeof data.moodoSlot0 !== 'undefined') { %><%= data.moodoSlot2 %><% } %>"
  data-moodoSlot3="<% if(typeof data.moodoSlot0 !== 'undefined') { %><%= data.moodoSlot3 %><% } %>"
  data-duration="<%= data.duration %>">
                  <div class="cueboardBadge">0</div>
                  <div class="cbKey"><%= data.hotkey %></div>
                  <div class="cbActionID"><%= data.actionID %></div>
                  <div class="cbChannel"><%= data.channel %></div>
                  <div class="cbCurve">
                    <div class="cbFadeIn"><% if(typeof data.fadeIn !== 'undefined' && data.fadeIn>0) { %><%= data.fadeIn %><% } else { %>0<% } %></div>
                    <div class="cbDuration"><%= data.duration %></div>
                    <div class="cbFadeOut"><% if(typeof data.fadeOut !== 'undefined' && data.fadeOut>0) { %><%= data.fadeOut %><% } else { %>0<% } %></div>
                  </div>
                </div>`;