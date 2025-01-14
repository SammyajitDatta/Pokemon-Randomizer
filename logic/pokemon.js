// Used to adjust the audio levels of the Little Root Town song in the background.
const audio = document.getElementById('backgroundAudio');
audio.volume = 0.05;

// States used to see which pokemon box is empty
const boxStates = [false, false, false, false, false , false];
// Used to see if a full team is created
allFull = false;

/*
  Randomly generate pokemon and display the pokemon for users to select. 
*/
async function fetchRandomPokemon(){
  // Obtain the random pokemon display element 
  const pokemonList = document.getElementById("Pokemon");
  pokemonList.innerHTML = '';

  // Generate 3 random pokemon to display to user
  for (let i=0; i<3; i++){
    const div = document.createElement('div');
    // Fetch a random pokemon pokemon from the API and format it as a json file
    let currentPokemon = await fetch("http://localhost:6968/api/random");
    let data = await currentPokemon.json();

    // Obtain pokemon name and format it to remove unneccessary words
    let pokemonName = data.pokemon;
    pokemonName = (pokemonName.replace("-gmax", "")).replace("-mega","");
    pokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);

    // Replace the -gmax picture with standard picture, personal choice
    let pokemonPicture = data.url.replace("-gmax", "");

    // Obtain the most used build for the pokemon and adjust the formatting to be displayed better
    let pokemonMoveset = data.moveset;
    let sendablePokemonMoveset = pokemonMoveset.replace(/Level:.*\n/, "");
    pokemonMoveset = sendablePokemonMoveset.replace(/.*@/, "Item: ");

    // Set the display for the pokemon
    //  \n and <br> are equivalent, but one is used for js and the other for html respectively
    div.innerHTML = `
      <button class = "pokemonSelect" onclick="selectPokemon('${pokemonName}', '${pokemonPicture}', '${sendablePokemonMoveset.replaceAll(/\n/g, '<br>')}')"> 
        <p class = "pName"> ${pokemonName} </p>
        <img class = "buttonPictures" src="${pokemonPicture}" /> 
        <p class = "pokemonbuild"> ${pokemonMoveset.replaceAll(/\n/g, '<br>')}</p> 
      </button>
    `;

    // Add to dispalyed pokemon
    pokemonList.append(div);

    // Update the button status to disable or undisable
    updateButton();
  }
}

// Stores a string of the full team currently stored, used for exporting 
currentTeam = "";

/*
Use this after selecting one of the random pokemon displayed and
then display it on the current team 'poke boxes'
*/
function selectPokemon(pokemonName, pokemonPicture, pokemonMoveset){
    // Iterate through all the pokeboxes and find out which is empty
    for (let i = 0; i<6; i++){
      if(!boxStates[i]){
        boxStates[i] = true;
        const box = document.getElementById(`${i+1}`);
        /* 
        Display the pokemon on the front of the box and display the build on the back.
        */
        box.innerHTML = `
        <div class="boxInner"> 
          <div class = "boxFront">       
            <p class ="pName"> ${pokemonName} </p>
            <img class = picture src="${pokemonPicture}" />
          </div>
          <div class = "boxBack">
            <p> ${pokemonMoveset} </p>
          </div>
        </div> 
        `
        // Condition set to true if the team is fully built
        if (i==5){
          allFull = true;
        }
        break;
      }
    }
    // Set the random pokemon display to show no other pokemon after selecting a pokemon
    const pokemonList = document.getElementById("Pokemon");
    pokemonList.innerHTML = '';
    
    // Update the status of the pokemon
    updateButton();

    /* 
    Format the current team to be appropriate for exporting.
    \n new line is used since this is inside a textarea when displayed on the html.
    Replace all branches with new lines as the moveset was inputted including new lines for display in non-textareas
    */
    currentTeam+=pokemonMoveset + "\n\n";
    currentTeam = currentTeam.replaceAll("<br>", "\n");

    // Display the exportable text for pokemon showdown
    const exportButton = document.getElementById("ExportToggle")
    exportButton.innerHTML = `${currentTeam}`;
}

// Used to disable or enable the button
async function updateButton(){

  // If the random pokemon are displayed or the team is full, disable the randomizerbutton
  // Else keep it enabled
  const button = document.getElementById("disableButton");
  let check = (document.getElementById("Pokemon").innerHTML == '')
  if (allFull || (!check)){
    button.disabled = true;
  } else {
    button.disabled = false;
  }
}

/*
Upon clicking the export button, display either the pokemon boxes or the exportable pokemon text
*/
async function exportPokemon(){
  const exportButton = document.getElementById("ExportToggle")
  const pokemonColumns = document.getElementById("pokecolumn")
  const pokemonColumnsTwo = document.getElementById("pokecolumn2")
  if (exportButton.style.display === 'none'){
    exportButton.style.display = 'flex';
  } else {
    exportButton.style.display = 'none';
  }
  if (pokemonColumns.style.display === 'none'){
    pokemonColumns.style.display = 'flex';
  } else {
    pokemonColumns.style.display = 'none';
  }
  if (pokemonColumnsTwo.style.display === 'none'){
    pokemonColumnsTwo.style.display = 'flex';
  } else {
    pokemonColumnsTwo.style.display = 'none';
  }
}


