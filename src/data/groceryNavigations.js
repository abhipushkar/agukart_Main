const groceryNavigations = [{
  icon: "Carrot",
  title: "Vegetables",
  href: "/category/vegetables"
}, {
  icon: "Apple",
  title: "Fruits & Vegetables",
  href: "/category/Fruits & Vegetables",
  child: [{
    title: "Fresh Frutes",
    href: "/category/Fresh Frutes",
    child: [{
      title: "Pears, apples, quinces",
      href: "/category/Pears, apples, quinces"
    }, {
      title: "Peaches, plums, apricots",
      href: "/category/Peaches, plums, apricots"
    }, {
      title: "Grapes",
      href: "/category/Grapes"
    }]
  }, {
    title: "Fresh Vegetables",
    href: "/category/Fresh Vegetables",
    child: [{
      title: "Onion",
      href: "/category/Onion"
    }, {
      title: "Potato",
      href: "/category/Potato"
    }, {
      title: "Vegetable Pack",
      href: "/category/Vegetable Pack"
    }]
  }]
}, {
  icon: "Milk",
  title: "Dariry & Eggs",
  href: "/category/Dariry & Eggs"
}, {
  icon: "Breakfast",
  title: "Breakfast",
  href: "/category/Breakfast"
}, {
  icon: "Yogurt",
  title: "Frozen",
  href: "/category/Frozen"
}, {
  icon: "Honey",
  title: "Organic",
  href: "/category/Organic"
}, {
  icon: "Beer",
  title: "Canned Food",
  href: "/category/Canned Food"
}, {
  icon: "Snack",
  title: "Coffee & Snacks",
  href: "/category/Coffee & Snacks"
}, {
  icon: "Bottle",
  title: "Sauces & Jems",
  href: "/category/Sauces & Jems"
}];
export default groceryNavigations;