/*!
 * jacksbox MineSweeper v0.9
 *
 * Author: Mario Jäckle
 * eMail: support@jacksbox.de
 */
(function(){ // without the wrapping, its not working on a server?

var app = angular.module('MineSweeper', []);
var DEV = false;		// are we in development mode?

app.controller('Game', function($scope, $interval) {
  $scope.dev = DEV;		// development var for frontend
  $scope.rows = 9;		// number of rows for the board
  $scope.cols = 9;		// number of columns
  $scope.mines = 10;	// number of mines - wow, who´d thought THAT?

  var stopwatch,		// varable to store the timer interval
  	  fieldsLeft = $scope.rows * $scope.cols;	// number of unopened fields

  /*
   * USEFULL INFORMTION:
   * field.states:
   * 0 = unopened
   * 1 = opened - normal field
   * 2 = flagged
   * 3 = opened - a bomb
   */	  

  // Field: left click event
  // open the field
  $scope.fieldOpen = function(row, col){
  	if(DEV) console.log('open it', row, col);

  	// is the game running and is the field unopened
  	if($scope.running && $scope.board[row][col].state === 0){

  		// check if the field was a bomb
  		if($scope.board[row][col].value === "x"){
  			$scope.board[row][col].state = 3;
  			gameOver();
  		}else{
  			cascade(row, col);
  			// no fields left to open? oh, you win :)
  			if(fieldsLeft <= $scope.mines){
  				win();
  			}
  		}
  	}

  };

  // Field: right click event
  // flag the field
  $scope.fieldFlag = function(row, col){
  	if(DEV) console.log('flag it', row, col);

  	// is the game running and is the field unopened or a flag
  	if(	$scope.running && 
  		($scope.board[row][col].state === 0 || $scope.board[row][col].state === 2)
  		){
  		// if the field is unopened
  		if($scope.board[row][col].state === 0){
  			$scope.board[row][col].state = 2; // set a flag
  			$scope.count--;
  			// this would check the board, if all flags are planted
  			// correctly - not sure if that´s the desired behaviour
  			// if($scope.count === 0){
  			// 	checkBoard();
  			// }
  		}else{
  			$scope.board[row][col].state = 0; // remove the flag
  			$scope.count++;
  		}
  	}
  };

  // open a cascade
  // open the field
  // if field.value = 0: open every adjacent field and repeat
  cascade = function(row, col){
  		$scope.board[row][col].state = 1;
  		fieldsLeft--;
		if($scope.board[row][col].value !== 0) return;
		if(row-1 >= 0){
			if(col-1 >= 0 && $scope.board[row-1][col-1].state === 0) cascade(row-1, col-1);
			if($scope.board[row-1][col].state === 0)  cascade(row-1, col);
			if(col+1 < $scope.cols && $scope.board[row-1][col+1].state === 0) cascade(row-1, col+1);
		}

		if(col-1 >= 0 && $scope.board[row][col-1].state === 0) cascade(row, col-1);
		if(col+1 < $scope.cols && $scope.board[row][col+1].state === 0) cascade(row, col+1);
		
		if(row+1 < $scope.rows){
			if(col-1 >= 0 && $scope.board[row+1][col-1].state === 0) cascade(row+1, col-1);
			if($scope.board[row+1][col].state === 0) cascade(row+1, col);
			if(col+1 < $scope.cols && $scope.board[row+1][col+1].state === 0) cascade(row+1, col+1);
		}
  };

  // did you win? did you?
  // checks the board if all flags are placed correctly
  // use with the out-commented code above
  // checkBoard = function() {
  // 	for(i = 0; i < $scope.rows; i++){
  // 		for(j = 0; j < $scope.cols; j++){
  // 			if( $scope.board[i][j].state === 2 && 
  // 				$scope.board[i][j].value !== "x"){
  // 				return false;
  // 			}
  // 		}
  // 	}
  // 	win();
  // };

  // you win... yay
  win = function(){
  	if(DEV) console.log("you win!");
  	$scope.running = false;
  	$scope.win = true;
  	stopTimer();
  };
  
  // the game has ended... badly
  gameOver = function(){
  	if(DEV) console.log("you loose!");
  	$scope.running = false;
  	$scope.loose = true;
  	stopTimer();
  };

  // timer
  startTimer = function(){
  	stopTimer();
  	$scope.timer = 0;
  	stopwatch = $interval(updateTimer, 1000, 0);
  	if(DEV) console.log("Timer staerted");
  };
  updateTimer = function(){
  	$scope.timer++;
  };
  stopTimer = function(){
	$interval.cancel(stopwatch);
  	if(DEV) console.log("Timer stopped");
  };

  // LOG FUNCTION FOR BOARD - JUST DEV
  // log the current board in the creation process
  logBoard = function(title) {
  	console.log("");
  	console.log(title+":");
  	for(i = 0; i < $scope.rows; i++){
  		var line = "";
  		for(j = 0; j < $scope.cols; j++){
  			line += $scope.board[i][j].value + " ";
  		}
  		console.log(line);
  	}
  	console.log("");
  };


  // create an empty board array
  $scope.createBoard = function(){
  	for(i = 0; i < $scope.rows; i++){
  		$scope.board[i] = [];
  		for (j = 0; j < $scope.cols ; j++) {
  			$scope.board[i][j] = {
  				"value": 	0,
  				"state": 	0,
  				"class": 	""
  			};
  		}
  	}  	
  };

  // randomplay places all mines in the board array
  $scope.placeMines = function(){
  	// number of mines to place
  	var mines = $scope.mines;
  	// place mines
  	while(mines > 0){
  		$scope.placeMine();
  		mines--;
  	}
  };

  // determins the position of a mine and places it in theboard array
  $scope.placeMine = function() {
  	var row =  Math.round(Math.random()*($scope.rows-1));
  	var col =  Math.round(Math.random()*($scope.cols-1));

  	if($scope.board[row][col].value !== "x"){
  		$scope.board[row][col].value = "x";
  		if(DEV) console.log("Mine placed", row, col, $scope.board[row][col].value);
  	}else{
  		$scope.placeMine();
  	}
  	return;
  };

  // iterates trough the array and sets the numbers for fields according to 
  // the adjacent mines
  $scope.calculateFieldValues = function(){
  	// determin number of mines for every field
  	for(i = 0; i < $scope.rows; i++){
  		for(j = 0; j < $scope.cols; j++){
			if($scope.board[i][j].value === "x") continue;
	
			if(i-1 >= 0){
				if(j-1 >= 0 && $scope.board[i-1][j-1].value === "x") $scope.board[i][j].value++;
				if($scope.board[i-1][j].value === "x") $scope.board[i][j].value++;
				if(j+1 < $scope.cols && $scope.board[i-1][j+1].value === "x") $scope.board[i][j].value++;
			}
	
			if(j-1 >= 0 && $scope.board[i][j-1].value === "x") $scope.board[i][j].value++;
			if(j+1 < $scope.cols && $scope.board[i][j+1].value === "x") $scope.board[i][j].value++;
			
			if(i+1 < $scope.rows){
				if(j-1 >= 0 && $scope.board[i+1][j-1].value === "x") $scope.board[i][j].value++;
				if($scope.board[i+1][j].value === "x") $scope.board[i][j].value++;
				if(j+1 < $scope.cols && $scope.board[i+1][j+1].value === "x") $scope.board[i][j].value++;
			}
  		}
  	}
  };

  // sets the game to "0" and recreates everything
  $scope.init = function() {
  	$scope.running = false;
  	$scope.win = false;
  	$scope.loose = false;
	
  	$scope.count = $scope.mines;
  	fieldsLeft = $scope.rows * $scope.cols;

  	$scope.timer = 0;

  	$scope.board = [];
  	$scope.createBoard();
  	$scope.placeMines();
  	$scope.calculateFieldValues();
  	if(DEV) logBoard("Board complete");

  	$scope.running = true;
  	$scope.win = false;
  	$scope.loose = false;
	
  	$scope.count = $scope.mines;
	
  	$scope.timer = 0;
  	startTimer();
  };

  // 3... 2... 1... liftoff!
  $scope.init();
});

// event listener for rightclicks
app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

})();  