some solutions for 
https://github.com/AlexNisnevich/untrusted
http://alex.nisnevich.com/untrusted/

/******************************/
/* build joystick wit player  *
			// define 'joystick' 0/0
            var centerX = 5;
            var centerY = map.getHeight() - 5;
            map.setSquareColor(centerX, centerY, '#9df');
            
            var player = map.getPlayer();
            
            var pX = player.getX();
            var pY = player.getY();
            
            if (pX == centerX) {
            	switch (pY) {
                	case centerY-1:
                		me.move('up');
                        break;
                    case centerY+1:
                    	me.move('down');
                        break;
                }
            } else {
            	if (pY == centerY) {
                  switch (pX) {
                      case centerX-1:
                          me.move('left');
                          break;
                      case centerX+1:
                          me.move('right');
                          break;
                  }
                }
            }
/* end of joystick system ;-) */
/******************************/
            
    /*    
        // exit this definition ;-)
        }
    });
    player.setPhoneCallback( function(){
    	//open up another blcok level to match closing..
        {
        	// 
     */   

	 
	 
player.setPhoneCallback( function(){
	var player = map.getPlayer();
	
	var colors = ['red', 'yellow', 'teal'];
	
	var colorIndex = 0;
	// search current color in list
	colorIndex = colors.indexOf(player.getColor());
	// set colorIndex +1
	colorIndex = colorIndex +1;
	if (colorIndex > colors.length) {
		colorIndex = 0;
	}
	player.setColor(colors[colorIndex]);
	
});

///// LEVEL 17
    } // end for loop
        
    
    // find a teleporter that is in the bottom right corner...
    // remember location in array:
    var teleDestList = [];
    
    var destmin = {
      x: 36,
      y: 18,
    }
    
    for (i = 0; i < teleportersAndTraps.length; i+=1) {
      var tele = teleportersAndTraps[i];
      if (tele.getType() == 'teleporter') {
        //var pos = map.getCanvasCoords(tele);
        if ( (tele.getX() > destmin.x) &&
            (tele.getY() > destmin.y) ) {
          teleDestList.push(i);
        }
      }
    }
      
      var teleDest = teleDestList[0];
    
    // highlite target
    map.setSquareColor(
      teleportersAndTraps[teleDest].getX(),
      teleportersAndTraps[teleDest].getY(),
      '#9b0');
    
    // now set all teleporters to the same target:
    for (i = 0; i < teleportersAndTraps.length; i+=1) {
         var tele = teleportersAndTraps[i];
        // set all teleporters to the special target.
        if (tele.getType() == 'teleporter') {
            if (tele == teleportersAndTraps[teleDest] ) {
                //handle self reference
                tele.setTarget(teleportersAndTraps[teleDestList[1]]);
            } else {
                  tele.setTarget(teleportersAndTraps[teleDest]);
            }   
        }
    } 
    
    
    // make some lines to see the connections
    for (i = 0; i < teleportersAndTraps.length; i+=2) {
        var t1 = teleportersAndTraps[i];
        var t2 = teleportersAndTraps[i+1];
        
        /**/
        // only draw lines if both sides are teleporters
        if ( (t1.getType() == 'teleporter') &&
             (t2.getType() == 'teleporter') )
        {
            var start = map.getCanvasCoords(t1);
            var end = map.getCanvasCoords(t2);
            
            // using canvas to draw the line
            var ctx = map.getCanvasContext();
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
         }
       /**/
/**/ 
// based on raft ;-)
        map.defineObject('bridge', {
          'type': 'none',
          'symbol': '¦',
          'color': '#420',
          'transport': true,
        });
        
        //player.move('up');
        for (i=20; i<30; i++) {
            map.placeObject(i, 12, 'bridge');
        }
