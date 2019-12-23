// Offline data
db.enablePersistence()
  .catch(err => {
    if(err.code === 'failed-precondition'){
      // probably multiple tabs open at once
      console.log('persistence failed')
    } else if(err.code == 'unimplemented'){
      // Lack of browser support
      console.log('persistence is not avalaible')
    }
  })


// Real time listener to control ui
db.collection('recepies').onSnapshot(snapshot => {
  // console.log(snapshot.docChanges())
  snapshot.docChanges().forEach(change => {
    // console.log(change.doc.id, change, change.doc.data())
  if(change.type === 'added'){
    renderRecipe(change.doc.data(), change.doc.id)
  }
  if(change.type === 'removed'){
    removeRecipe(change.doc.id)
  }
  if(change.type === 'modified'){

  }
  })
})


// Add a recipe
const form = document.querySelector('form')
form.addEventListener('submit', e => {
  e.preventDefault()
  const recipe = {
    title: form.title.value,
    ingredient: form.ingredient.value
  }

  db.collection('recepies').add(recipe)
  .catch(err=> console.log(err))
  form.title.value= ''
  form.ingredient.value = ''
})

// Delete Recipe
const recipeContainer = document.querySelector('.recipes')
recipeContainer.addEventListener('click', e => {
  if(e.target.tagName === 'I'){
    const id = e.target.getAttribute('data-id')
    db.collection('recepies').doc(id).delete()
  }
})


