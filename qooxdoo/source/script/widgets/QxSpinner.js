function QxSpinner()
{
  QxWidget.call(this);
  
  this.setWidth(60);
  this.setHeight(22);
  this.setBorder(QxBorder.presets.inset);
  this.setTabIndex(1);  

  // ***********************************************************************
  //   RANGE MANAGER
  // ***********************************************************************  
  this._manager = new QxRangeManager();


  // ***********************************************************************
  //   TEXTFIELD
  // ***********************************************************************  
  this._textfield = new QxTextField();
  this._textfield.set({ left: 0, right: 16, bottom: 0, top: 0, textAlign : "right", text : this.getValue() });
  
  this.add(this._textfield);
  

  // ***********************************************************************
  //   UP-BUTTON
  // ***********************************************************************
  this._upbutton = new QxWidget();
  this._upbutton.set({ top: 0, bottom: "50%", width: 16, right: 0, border: QxBorder.presets.outset, canSelect : false });
  
  this._upbuttonimage = new QxImage(QxSpinner._arrowUpImage, 5, 3);
  this._upbuttonimage.set({ top: 1, left: 3, anonymous : true });
  
  this._upbutton.add(this._upbuttonimage);
  this.add(this._upbutton);


  // ***********************************************************************
  //   DOWN-BUTTON
  // ***********************************************************************
  this._downbutton = new QxWidget();
  this._downbutton.set({ top: "50%", bottom: 0, width: 16, right: 0, border: QxBorder.presets.outset, canSelect : false });
  
  this._downbuttonimage = new QxImage(QxSpinner._arrowDownImage, 5, 3);
  this._downbuttonimage.set({ top: 1, left: 3, anonymous : true });
  
  this._downbutton.add(this._downbuttonimage);
  this.add(this._downbutton);
  
  
  // ***********************************************************************
  //   TIMER
  // ***********************************************************************
  this._timer = new QxTimer(this.getInterval());
  
  
  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************
  this.addEventListener("keypress", this._onkeypress, this);
  this.addEventListener("keydown", this._onkeydown, this);
  this.addEventListener("keyup", this._onkeyup, this);
  this.addEventListener("mousewheel", this._onmousewheel, this);
  
  this._textfield.addEventListener("input", this._oninput, this);
  this._textfield.addEventListener("blur", this._onblur, this);
  this._upbutton.addEventListener("mousedown", this._onmousedown, this);
  this._downbutton.addEventListener("mousedown", this._onmousedown, this);  
  this._manager.addEventListener("change", this._onchange, this);      
  this._timer.addEventListener("interval", this._oninterval, this);
};

QxSpinner.extend(QxWidget, "QxSpinner");



/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

/*!
  The value.
*/
QxSpinner.addProperty({ name : "value", type : Number, defaultValue : 0 });

/*!
  The minimum value.
*/
QxSpinner.addProperty({ name : "min", type : Number });

/*!
  The maximum value.
*/
QxSpinner.addProperty({ name : "max", type : Number });

/*!
  The amount to increment on each event (keypress or mousedown).
*/ 
QxSpinner.addProperty({ name : "incrementAmount", type : Number, defaultValue : 1 });

/*!
  The amount to increment on each event (keypress or mousedown).
*/ 
QxSpinner.addProperty({ name : "wheelIncrementAmount", type : Number, defaultValue : 1 });

/*!
  The current value of the interval (this should be used internally only).
*/ 
QxSpinner.addProperty({ name : "interval", type : Number, defaultValue : 100 });

/*!
  The first interval on event based shrink/growth of the value.
*/ 
QxSpinner.addProperty({ name : "firstInterval", type : Number, defaultValue : 500 });

/*!
  This configures the minimum value for the timer interval.
*/ 
QxSpinner.addProperty({ name : "minTimer", type : Number, defaultValue : 20 });

/*!
  Decrease of the timer on each interval (for the next interval) until minTimer reached.
*/
QxSpinner.addProperty({ name : "timerDecrease", type : Number, defaultValue : 2 });

/*!
  If minTimer was reached, how much the amount of each interval should growth (in relation to the previous interval).
*/
QxSpinner.addProperty({ name : "amountGrowth", type : Number, defaultValue : 1.01 });




/*
  -------------------------------------------------------------------------------
    CONFIGURATION
  -------------------------------------------------------------------------------
*/

QxSpinner._arrowUpImage = "../../images/core/arrows/up_small.gif";
QxSpinner._arrowDownImage = "../../images/core/arrows/down_small.gif";




/*
  -------------------------------------------------------------------------------
    PREFERRED DIMENSIONS
  -------------------------------------------------------------------------------
*/

proto.getPreferredHeight = function() {
  return 22;
};

proto.getPreferredWidth = function() {
  return 60;
};





/*
  -------------------------------------------------------------------------------
    KEY EVENT-HANDLING
  -------------------------------------------------------------------------------
*/

proto._onkeypress = function(e)
{
  var vCode = e.getKeyCode();

  if (vCode == QxKeyEvent.keys.enter && !e.getAltKey())
  {
    this._ensureValidValue();
    this._textfield.selectAll();
  }
  else
  {
    switch (vCode)
    {
      case QxKeyEvent.keys.up:
      case QxKeyEvent.keys.down:
      
      case QxKeyEvent.keys.left:
      case QxKeyEvent.keys.right:
      
      case QxKeyEvent.keys.shift:
      case QxKeyEvent.keys.ctrl:
      case QxKeyEvent.keys.alt:
      
      case QxKeyEvent.keys.esc:
      case QxKeyEvent.keys.del:
      case QxKeyEvent.keys.backspace:
      
      case QxKeyEvent.keys.insert:
      
      case QxKeyEvent.keys.home:
      case QxKeyEvent.keys.end:
      
      case QxKeyEvent.keys.pageup:
      case QxKeyEvent.keys.pagedown:
      
      case QxKeyEvent.keys.numlock:
      case QxKeyEvent.keys.tab:
        break;
        
      default:
        if (vCode >= 48 && vCode <= 57) {
          return;
        };
        
        e.preventDefault();
    };
  };
};

proto._onkeydown = function(e)
{
  var vCode = e.getKeyCode();

  if (this._tickIncrease == null && (vCode == QxKeyEvent.keys.up || vCode == QxKeyEvent.keys.down))
  {
    this._tickIncrease = vCode == QxKeyEvent.keys.up;
    
    this._resetIncrements();
    this._ensureValidValue();
    this._increment();
    
    this._timer.startWith(this.getFirstInterval());
  };
};

proto._onkeyup = function(e)
{
  if (this._tickIncrease != null)
  {
    switch(e.getKeyCode())
    {
      case QxKeyEvent.keys.up:
      case QxKeyEvent.keys.down:
        this._timer.stop();
        this._tickIncrease = null;
    };
  };
};





/*
  -------------------------------------------------------------------------------
    MOUSE EVENT-HANDLING
  -------------------------------------------------------------------------------
*/

proto._onmousedown = function(e)
{
  if (e.isNotLeftButton()) {
    return;
  };

  this._ensureValidValue();
  
  var vButton = e.getCurrentTarget();
  
  vButton.setBorder(QxBorder.presets.inset);
  
  vButton.addEventListener("mouseup", this._onmouseup, this);
  vButton.addEventListener("mouseout", this._onmouseup, this);
  
  this._tickIncrease = vButton == this._upbutton;
  this._resetIncrements();
  this._increment();
  
  this._textfield.selectAll();
  
  this._timer.setInterval(this.getFirstInterval());
  this._timer.start();
};

proto._onmouseup = function(e)
{
  var vButton = e.getCurrentTarget();
  
  vButton.setBorder(QxBorder.presets.outset);
  
  vButton.removeEventListener("mouseup", this._onmouseup, this);
  vButton.removeEventListener("mouseout", this._onmouseup, this);
  
  this._textfield.selectAll();
  this._textfield.setFocused(true);
  
  this._timer.stop();
  this._tickIncrease = null;
};

proto._onmousewheel = function(e)
{
  this._manager.setValue(this._manager.getValue() + this.getWheelIncrementAmount() * e.getWheelDelta());
  this._textfield.selectAll();
};




/*
  -------------------------------------------------------------------------------
    OTHER EVENT-HANDLING
  -------------------------------------------------------------------------------
*/

proto._oninput = function(e) {
  this._ensureValidValue();
};

proto._onchange = function(e)
{
  this._textfield.setText(this._manager.getValue());
  
  if (this.hasEventListeners("change")) {
    this.dispatchEvent(new QxEvent("change"));
  };
};

proto._onblur = function(e) {
  this._ensureValidValue();
};






/*
  -------------------------------------------------------------------------------
    MAPPING TO RANGE MANAGER
  -------------------------------------------------------------------------------
*/

proto.setValue = function(nValue) {
  this._manager.setValue(nValue);
};

proto.getValue = function()
{
  this._ensureValidValue();
  return this._manager.getValue();
};

proto.setMax = function(vMax) {
  return this._manager.setMax(vMax);
};

proto.getMax = function() {
  return this._manager.getMax();
};

proto.setMin = function(vMin) {
  return this._manager.setMin(vMin);
};

proto.getMin = function() {
  return this._manager.getMin();
};









/*
  -------------------------------------------------------------------------------
    INTERVAL HANDLING
  -------------------------------------------------------------------------------
*/

proto._tickIncrease = null;

proto._oninterval = function(e)
{
  this._timer.stop();
  this.setInterval(Math.max(this.getMinTimer(), this.getInterval()-this.getTimerDecrease()));

  if (this.getInterval() == this.getMinTimer()) {
    this.setIncrementAmount(this.getAmountGrowth() * this.getIncrementAmount());
  };

  this._increment();
  this._timer.restartWith(this.getInterval());
};





/*
  -------------------------------------------------------------------------------
    UTILITY
  -------------------------------------------------------------------------------
*/

proto._ensureValidValue = function(e)
{
  var el = this._textfield.getElement();  
  
  if (!el) {
    return;
  };
  
  var val = parseInt(el.value);
  if (!isNaN(val)) {
    this._manager.setValue(val);
  };
  
  var fixedValue = this._manager.getValue();  
  this._textfield.setText(fixedValue);

  if (fixedValue != el.value) {
    el.value = fixedValue;
  };
};

proto._increment = function() {
  this._manager.setValue(this._manager.getValue() + ((this._tickIncrease ? 1 : - 1) * this.getIncrementAmount()));
};

proto._resetIncrements = function()
{
  this.resetIncrementAmount();
  this.resetInterval();
};





/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };
  
  this.removeEventListener("keypress", this._onkeypress, this);
  this.removeEventListener("keydown", this._onkeydown, this);
  this.removeEventListener("keyup", this._onkeyup, this);
  
  if (this._textfield)
  {
    this._textfield.removeEventListener("blur", this._onblur, this);
    this._textfield.dispose();
    this._textfield = null;
  };
  
  if (this._upbutton)
  {
    this._upbutton.removeEventListener("mousedown", this._onmousedown, this);
    this._upbutton.dispose();
    this._upbutton = null;
  };
  
  if (this._downbutton)
  {
    this._downbutton.removeEventListener("mousedown", this._onmousedown, this);  
    this._downbutton.dispose();
    this._downbutton = null;
  };  
  
  if (this._timer)
  {
    this._timer.removeEventListener("interval", this._oninterval, this);
    this._timer.stop();
    this._timer.dispose();
    this._timer = null;
  };
  
  if (this._manager)
  {
    this._manager.removeEventListener("change", this._onchange, this);      
    this._manager.dispose();
    this._manager = null;
  };
  
  return QxWidget.prototype.dispose.call(this); 
};