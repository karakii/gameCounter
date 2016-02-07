'GameItems' = new Collection('gameitems');

if (Meteor.isClient) {
// have key and map off key name? can use for setup to call props and achievements
// can also have 2 PKs, set and level, use both keys

//Class for properties
function gameProperties ( currentValue, operator, requirement, imgDir, propDescription, lockStatus) {
  this.operator = operator;
  this.currentValue = currentValue;
  this.requirement = requirement;
  this.propDescription = propDescription;
  this.imgDir = imgDir;
  this.requirementMet = 0;  //default false
  if (lockStatus == "locked"){ this.unlocked = 0;  // unlocked unless requirement "locked"
  } else { this.unlocked = 1; }


  //Requirements Functions//////////////////////////////////////////
  this.checkRequirement = function() {
    switch(this.operator) {
    case "less_than": this.requirementMet = (this.currentValue < this.requirement); break;
    case "less_than_or_equal_to": this.requirementMet = (this.currentValue <= this.requirement); break;
    case "greater_than": this.requirementMet = (this.currentValue > this.requirement); break;
    case "greater_than_or_equal_to": this.requirementMet = (this.currentValue >= this.requirement); break;
    default: this.requirementMet = (this.currentValue == this.requirement);
    }
    return this.requirementMet;
  }
  this. reqIsMet = function() {
    return this.requirementMet;
  }
  this.requirementValue = function() {
    return this.requirement;
  }

  //Unlock Functions///////////////////////////////////////////////////////
  this.unlock = function() {
    if(this.unlocked == 0) { this.unlocked = 1;
    } else {
      this.unlocked = 0;
    }
    return this.unlocked;
  }

  this.checkUnlockStatus = function () {
    return this.unlocked;
  }
// Ancillary Functions//////////////////////////////////////////////////
  this.checkIfActive = function() {
    return this.ignoreMe;
  }
  this.currentMetric = function() {
    return this.currentValue;
  }
  this.imageDirectory = function() {
    return this.imgDir;
  }
  this.checkDescription = function() {
    return this.propDescription;
  }
////////////////////////////////////////////
}

// Class to set Locked and Unlocked Levels based on target properties and related properties.
// set target properties to match against and unlock related properties upon completion of targets
function Achievements( level_name, target_props, related_props) {
  this.level_name = level_name;
  this.related_props = related_props;
  this.target_props  = target_props;
// to unlock, target values must meet reqs and be unlocked
  this.unlock_level = function() {
    var countAchievements = 0;
    for (var i = 0; i < target_props.length; i++) {
  //    console.log("entered for loop! " +  i);
      if (target_props[i].reqIsMet() == 1 && target_props[i].checkUnlockStatus() == 1) {
        countAchievements++;
  //      console.log("entered checkstatus = 1! " +  i);
      }
    }
    if (countAchievements == target_props.length) {
      return 1;
    } else {
      return 0;
    }
  }
  // if targets completed, then unlock related
  this.unlock_related_props = function () {
    if (this.unlock_level() == 0) {
      return 0;
    } else {
      for (var i = 0; i < related_props.length; i++) {
        if (related_props[i] != 1) {
          related_props[i].unlock();
        }
      }
      return 1;
    }
  }
}

// gets current level of given set
function getLevel(set) {
  var level;
  for (var m = 0; m < set.length; m++) {
    if (set[m].checkIfActive() == 1) {
    }else {
      if (set[m].checkUnlockStatus() == 0 ){
        return m;
        break;
      } else if (set[m].checkRequirement() == 0) {
        return m;
      } else if (m == set.length-1) {
        return m+1;
      }
    }
  }
}



// run sequence: checkrequirements (runs against all reqs, regardless of restrictions),
// then unlock restrictions, then get current levels
function runChecks( sets, restrictions ) {
//run checkRequirements to set reqIsMet called in unlock_level
  for (var i = 0; i < sets.length; i++) {
    for (var j = 0; j < sets[i].length; j++) {
      sets[i][j].checkRequirement();
    }
  }
  //check if preresquisite is unlocked, unlock related props
  for (var i = 0; i < restrictions.length; i++) {
    restrictions[i].unlock_level();
  restrictions[i].unlock_related_props();
  }
  //get current Levels for all sets in a single array
  for (var i = 0; i < sets.length; i++) {
    currentLevels[i] = getLevel(sets[i]);
  }
}
// INPUTS - TESTING SET////////////////////////////////////////

// from database query
var currentLogins = 5;
var currentTreats = 10;
var currentBarks = 40;
var currentFriends = 50;
var currentTip = 20;
var profileComplete = "profile complete";
var petPals = 2;
var locked = "locked";
var notlocked = "notlocked";
var sharedLinks = 3;


// SET /////////////////////////////////////////////
var setA = [
  // currentParameter, operator, requirement, img_path, level_description
  new gameProperties(profileComplete, "equals_to", "profile complete","/Level_1.jpg", "100% Profile Complete"),
  new gameProperties(petPals, "greater_than_or_equal_to", 1 , "/Level_2.jpg", "Add/Follow Petpal" ),
  new gameProperties(currentLogins, "greater_than_or_equal_to", 5, "/Level_3.jpg", "5 consecutive logins" ),
  new gameProperties(currentLogins, "greater_than_or_equal_to", 10, "/Level_4.jpg", "10 consecutive logins" ),
  new gameProperties(currentLogins, "greater_than_or_equal_to", 30, "/Level_5.jpg", "30 consecutive logins" )
];

var setB = [
  // currentParameter, operator, requirement, img_path, level_description,
  new gameProperties(currentBarks, "greater_than_or_equal_to", 1, "/Level_1.jpg", "1 Bark", "locked"  ),
  new gameProperties(currentTreats, "greater_than_or_equal_to", 10, "/Level_2.jpg", "10 Treats" ),
  new gameProperties(currentTreats, "greater_than_or_equal_to", 25, "/Level_3.jpg", "25 Treats" ),
  new gameProperties(currentTreats, "greater_than_or_equal_to", 100, "/Level_4.jpg", "100 Treats" )
];

var setC = [
  // currentParameter, operator, requirement, img_path, level_description
  new gameProperties(sharedLinks, "greater_than_or_equal_to", 1 , "/Level_1.jpg", "Share a Social Media Link", "locked" ),
  new gameProperties(currentFriends, "greater_than_or_equal_to", 10, "/Level_2.jpg", "10 Friends" ),
  new gameProperties(currentFriends, "greater_than_or_equal_to", 25, "/Level_3.jpg", "25 Friends" ),
  new gameProperties(currentFriends, "greater_than_or_equal_to", 50, "/Level_4.jpg", "50 Friends" )
];

var setD = [
  // currentParameter, operator, requirement, img_path, level_description
  new gameProperties(currentTip, "greater_than_or_equal_to", 1, "/Level_1.jpg", "1 tip of the day", "locked" ),
  new gameProperties(currentTip, "greater_than_or_equal_to", 10, "/Level_2.jpg", "5 tips of the day" ),
  new gameProperties(currentTip, "greater_than_or_equal_to", 25, "/Level_3.jpg", "25 tips of the day" ),
  new gameProperties(currentTip, "greater_than_or_equal_to", 50, "/Level_4.jpg", "50 tips of the day" )
];

var setE = [
  // currentParameter, operator, requirement, img_path, level_description
  new gameProperties(currentBarks, "greater_than_or_equal_to", 30, "/Level_2.jpg", "30 Barks", "locked" ),

];

var sets = [ setA, setB, setC, setD, setE ];

// restrictions 0 based
var restrictions =[
  new Achievements("Level_1", [sets[0][0]], [sets[1][0],sets[2][0],sets[3][0]]),
  new Achievements("Level_5", [sets[0][3],sets[1][3],sets[2][3],sets[3][3]], [sets[4][0]])
];

// overall level definitions
var level1 = [ sets[0][0]];
var level2 = [ sets[0][1],sets[1][0],sets[2][0],sets[3][0]];
var level3 = [ sets[0][2],sets[1][1],sets[2][1],sets[3][1]];
var level4 = [ sets[0][3],sets[1][2],sets[2][2],sets[3][2]];
var level5 = [ sets[0][4],sets[1][3],sets[2][3],sets[3][3], sets[4][0]];

var levelMap = [level1, level2, level3, level4, level5];

//current Levels in array form
var currentLevels = [];

console.log(sets[0][3].requirementValue());
console.log(sets[0][3].currentMetric());
console.log(sets[0][3].currentMetric()/sets[0][3].requirementValue());

runChecks(sets, restrictions);
for (var i =0; i < currentLevels.length; i++) {
}



////////////////////////////////////////////////////////////////////
  function getOverall( mapArray) {
    for (var i = 0; i < mapArray.length; i++) {
      for (var m = 0; m < mapArray[i].length; m++ ) {
        if (mapArray[i][m].reqIsMet() == 0) {
          return i;
        }
      }
      if (i == mapArray.length -1) {
        return i+1;
      }
    }
  }

  function sumTotalLevels (currLevels) {
    var sumOfLevels = 0;
    for (var i = 0; i < currLevels.length; i++) {
       sumOfLevels = sumOfLevels + currLevels[i];
    }
    return sumOfLevels;
  }
  ///////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// Global Variables
///////////////////////////////////////////////////////
  Template.registerHelper('currentPetPals', function() {
    return petPals;
  });
  Template.registerHelper('currentBarks', function() {
    return currentBarks;
  });
  Template.registerHelper('currSumOfLevel', function () {
    return sumTotalLevels(currentLevels);
  });
  Template.registerHelper('currOverallLevel', function () {
    return getOverall(levelMap);;
  });

  //////////////////////////////////////////////////

  Template.modalTiles.helpers({
    currentSetLevel: function () {
      return currentLevels;
    },
     currentSource: function () {
       var currentArray = [];
       for (var i = 0 ; i < currentLevels.length; i++) {
         if (currentLevels[i] == sets[i].length) {
           currentArray[i] =  "All Levels Completed";
         } else if (sets[i][currentLevels[i]].checkUnlockStatus() == 0) {
           currentArray[i] = "locked";
         } else {
           currentArray[i] = sets[i][currentLevels[i]].currentMetric();
         }
       }
       return currentArray;
     },
     currentImg: function() { // validate this
      var imgArray = [];
      for (var i = 0 ; i < currentLevels.length; i++) {
        if (currentLevels[i] == 0) {
          imgArray[i] = "/locked.png";
        } else {
          imgArray[i] = sets[i][currentLevels[i]-1].imageDirectory();
        }
      }
      return imgArray;
     },
    nextRequirement: function () {
      var requirementArray = [];
      for (var i = 0 ; i < currentLevels.length; i++) {
        if (currentLevels[i] == sets[i].length) {
          requirementArray[i] =  "All Levels Completed";
        } else if (sets[i][currentLevels[i]].checkUnlockStatus() == 0) {
          requirementArray[i] = "locked";
        } else {
          requirementArray[i] = sets[i][currentLevels[i]].checkDescription();
        }
      }
      return requirementArray;
    },
    levelProgress: function () {
      var progressArray = [];
      for (var i = 0 ; i < currentLevels.length; i++) {
        if (currentLevels[i] == sets[i].length) {
          progressArray[i] =  "100";
        } else if (sets[i][currentLevels[i]].checkUnlockStatus() == 0) {
          progressArray[i] = "locked";
        } else {
          progressArray[i] = 100*sets[i][currentLevels[i]].currentMetric()/sets[i][currentLevels[i]].requirementValue();
        }
      }
      return progressArray;
    },
    nextReqValue: function () {
      var nextReqArray = [];
      for (var i = 0 ; i < currentLevels.length; i++) {
        if (currentLevels[i] == sets[i].length) {
          nextReqArray[i] =  "";
        } else if (sets[i][currentLevels[i]].checkUnlockStatus() == 0) {
          nextReqArray[i] = "locked";
        } else {
          nextReqArray[i] = sets[i][currentLevels[i]].requirementValue();
        }
      }
      return nextReqArray;
    }
  });

  Template.modalTiles.events({

  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
