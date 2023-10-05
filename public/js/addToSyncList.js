function addToSyncList(i, syncLists, ta, st, en, moment) {
  var p = null;
  for (j in ta) {
      if (ta[j].id == ta[i].syncParent) {
          var p = ta[j];
          break;
      }
  }
  if (p !== null) {
      // calculate relative time in ms, then add to parent's sync list
      var rt = moment.duration(moment(ta[i].start).diff(p.start));
      // console.log('calculating the difference between ' + ta[i].start + ' and ' + p.start + ' in milliseconds');
      var ms = rt.as('milliseconds');
      // console.log('result: ' + ms + 'ms');
      var duration = moment.duration(en.diff(st)).as('seconds');
      var action = {

          "actionID": ta[i].actionID,
          "to": ta[i].group,
          "fadeIn": ta[i].fadeIn,
          "fadeOut": ta[i].fadeOut,
          "duration": duration,
          "color": ta[i].color,
          "moodoSlot0": ta[i].moodoSlot0,
          "moodoSlot1": ta[i].moodoSlot1,
          "moodoSlot2": ta[i].moodoSlot2,
          "moodoSlot3": ta[i].moodoSlot3

      };
      if (typeof syncLists[p.group] === 'undefined') {
          syncLists[p.group] = {};
      }
      if (typeof syncLists[p.group][p.id] === 'undefined') {
          syncLists[p.group][p.id] = {};
      }
      if (typeof syncLists[p.group][p.id][ms + 'ms'] === 'undefined') {
          syncLists[p.group][p.id][ms + 'ms'] = {
              "time": ms,
              "actions": []
          };
      }
      syncLists[p.group][p.id][ms + 'ms'].actions.push(action);

  }
}                        

if(typeof module !== 'undefined') {
	module.exports = {
		'addToSyncList':addToSyncList
	}
}