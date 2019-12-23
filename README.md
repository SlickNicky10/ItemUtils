# ItemUtils
ItemUtils module for use with Drupi. Download Drupi at https://stacket.net/drupi

The current latest version of ItemUtils is **1.0**, and this documentation will always be in reference to the latest version of ItemUtils.

# What's ItemUtils?
ItemUtils is a Drupi module that makes creating items and interactive GUIs fast and easy. ItemUtils can be used for simple things, like making it easier to give a player an item, or to create a deep system of interactive inventories. The possibilities are limitless!

# Install Guide
Firstly, make sure that `Drupi` is installed on your server. If it isn't, you can download it from https://stacket.net/drupi. Once Drupi is installed, restart your server and execute the command `/drupi install ItemUtils`. You can now use TaskUtils in your Drupi scripts!

# How to use ItemBuilder

There are 4 parameters that can be passed to the ItemBuilder constructor. These are:

`material` *(string)* - the Material you want to use. Example: "DIAMOND". A list of valid materials is available at https://hub.spigotmc.org/javadocs/spigot/org/bukkit/Material.html.

`name` *(string) (optional, nullable)* - an optional custom name for the item.

`lore` *(array) (optional, nullable)* - an optional custom lore for the item.

`options` *(object) (optional, nullable)* - additional options for further customization of the ItemStack. Valid options:

    amount (int) - amount of the item in the ItemStack.
  
    durability (int) - durability value of the item.
  
    enchantments (array) - an array containing enchantments to apply to the item. Covered in more detail later.
  
    flags (array) - an array containing item flags to apply to the item. Covered in more detail later.

Let's start out simple, and create a diamond sword named "OP Sword", with lore.

```js
const ItemUtils = require("ItemUtils");
const ItemBuilder = ItemUtils.ItemBuilder;
const item = new ItemBuilder("DIAMOND_SWORD", "OP Sword", [color("&aA very strong weapon!"), color("&7Will kill many players.")]);
```

Right now, our "OP Sword" isn't very powerful, because it doesn't have any enchantments. Let's fix that by **adding some enchantments** using the `options` paramater.

Each enchantment is another object inside of an array, formatted like this:

```js
{id: "ENCHANTMENT_ID", level: 3}
```

If `level` is not declared, it will be set to **1** by default.

A full list of enchantment IDs can be found here: https://hub.spigotmc.org/javadocs/spigot/org/bukkit/enchantments/Enchantment.html

```js
const ItemUtils = require("ItemUtils");
const ItemBuilder = ItemUtils.ItemBuilder;
const item = new ItemBuilder("DIAMOND_SWORD", "OP Sword", [color("&aA very strong weapon!"), color("&7Will kill many players.")], {
    enchantments: [
        {id: "DAMAGE_ALL", level: 10},
        {id: "FIRE_ASPECT"}
    ]
});
```

Now, our "OP Sword" is actually powerful, as it has Sharpness 10 and Fire Aspect 1.

Maybe we want to remove the "+19.5 Attack Damage" text that Minecraft adds to the sword too. This can be done by adding the `HIDE_ATTRIBUTES` item flag to our sword.

```js
const ItemUtils = require("ItemUtils");
const ItemBuilder = ItemUtils.ItemBuilder;
const item = new ItemBuilder("DIAMOND_SWORD", "OP Sword", [color("&aA very strong weapon!"), color("&7Will kill many players.")], {
    enchantments: [
        {id: "DAMAGE_ALL", level: 10},
        {id: "FIRE_ASPECT"}
    ],
    flags: ["HIDE_ATTRIBUTES"]
});
```

A full list of item flags can be found here: https://hub.spigotmc.org/javadocs/spigot/org/bukkit/inventory/ItemFlag.html

# How to use InventoryBuilder

InventoryBuilder is an easy way to create an inventory. These are ***not*** GUIs, but can be used in creating GUIs, which will be covered when detailing `GUIManager`.

There are 4 parameters that can be passed to the InventoryBuilder constructor. These are:

`rows` *(int)* - the amount of rows the inventory will have.

`name` *(string) (nullable)* - a custom name for the inventory.

`items` *(object)* - an object containing items to use in the inventory.

`defaultItem` *(ItemStack) (optional)* - a default item for the inventory. If declared, this item will be placed in any slot that was not defined in the `items` paramater.

Here is a simple example of a potential claim prize inventory for a crate system:

```js
const ItemUtils = require("ItemUtils");
const ItemBuilder = ItemUtils.ItemBuilder;
const InventoryBuilder = ItemUtils.InventoryBuilder;
const inventory = new InventoryBuilder(3, color("&eYou won a prize!"), {
    13: new ItemBuilder("GOLDEN_APPLE", color("&816x &rGolden Apple"), [color("&8&m--------------------"), color("&7You will be given"), color("&7this prize!")], {
        amount: 16
    })
}, new ItemBuilder("DIAMOND_BLOCK", color("&r")));
```

In this example, the "prize" will appear in the middle slot, and every other slot will contain diamond blocks instead of air.

## Functions can also be passed as items

An InventoryBuilder item can also accept a function as an argument, and its returned value will be used as the item for that slot. Example:

```js
const inventory = new InventoryBuilder(1, "Test", {
    0: new ItemBuilder("APPLE"),
    1: () => {
        if(Math.random() < 0.5) return new ItemBuilder("DIAMOND");
        return new ItemBuilder("COAL");
    }
});
```

# How to use GUIManager

There are 7 methods that can be used on the GUIManager object. These are:

`displayTemporaryMenu(player, view, actions, options)` - displays a temporary menu to the player.

`isViewingGUI(player)` - returns whether the player is currently viewing an ItemUtils GUI or not.

`createGlobalMenu(id, view, actions, options)` - creates a global menu with a given ID.

`deleteGlobalMenu(id)` - deletes a global menu.

`displayGlobalMenu(player, id)` - displays an existing global menu to the player.

`setGlobalAction(action)` - sets the global action that will be executed any time a player performs an ItemUtils GUI action.

`createViewFromTemplate(id, name, items)` - creates an inventory from a GUI template, which was declared in the ItemUtils config.

## ItemUtils divides its GUIs into two types:

**Temporary:** a temporary GUI is created when it is displayed to a player, and is then deleted as soon as the player exits the GUI. Temporary GUIs are recommended for dynamic GUIs, example a stats menu.

**Global:** a global GUI is created and then stored in memory, tracked by an ID. As many players can be viewing a global GUI at the same time as you want. Global GUIs are only deleted if the `deleteGlobalMenu` method is called to remove it. Global GUIs are recommended for static GUIs, example a shop or a help menu.

Let's start with creating a simple, temporary GUI, that displays some simple information about the player.

For the sake of these examples, let's assume that we don't want the player to be able to take any items out of the GUI, or put items in, so we will use the `setGlobalAction` method to do that.

```js
const ItemUtils = require("ItemUtils");
const ItemBuilder = ItemUtils.ItemBuilder;
const InventoryBuilder = ItemUtils.InventoryBuilder;
const GUIManager = ItemUtils.GUIManager;

GUIManager.setGlobalAction(event => {
    event.setCancelled(true);
});

command.create("info", "test", sender => {
    const player = cast.asPlayer(sender);
    GUIManager.displayTemporaryMenu(player, new InventoryBuilder(3, color(`&9${player.getName()}'s Profile`), {
        13: new ItemBuilder("NETHER_STAR", "Me!", [color(`&c❤ ${player.getHealth()} HP`), "Something else..."])
    }), {
        13: event => {
            // player works because this is a temporary menu and can reference variables defined in the command before it.
            player.sendMessage("Hi there!");
        }
    });
});
```

This is a simple GUI, with a nether star in the middle slot that will display the player's current health, and when clicked on, will say hello to them in chat.

Now, let's try creating a simple shop using a global GUI. Our shop will only sell two items, not very impressive.

```js
const ItemUtils = require("ItemUtils");
const ItemBuilder = ItemUtils.ItemBuilder;
const InventoryBuilder = ItemUtils.InventoryBuilder;
const GUIManager = ItemUtils.GUIManager;

GUIManager.setGlobalAction(event => {
    event.setCancelled(true);
});

GUIManager.createGlobalMenu("shop", new InventoryBuilder(1, color("&9Shop"), {
    0: new ItemBuilder("DIAMOND", null, [color("&8Price: &716 Coal")]),
    1: new ItemBuilder("GOLDEN_APPLE", null, [color("&8Price: &74 Emeralds")])
}), {
    0: event => {
        const player = event.getWhoClicked();
        const inventory = player.getInventory();
        if(inventory.containsAtLeast(new ItemBuilder("COAL"), 16)){
            inventory.removeItem(new ItemBuilder("COAL", null, null, {amount: 16}));
            inventory.addItem(new ItemBuilder("DIAMOND"));
        } else {
            player.sendMessage(color("&cYou don't have enough Coal!"));
        }
    },
    1: event => {
        const player = event.getWhoClicked();
        const inventory = player.getInventory();
        if(inventory.containsAtLeast(new ItemBuilder("EMERALD"), 4)){
            inventory.removeItem(new ItemBuilder("EMERALD", null, null, {amount: 4}));
            inventory.addItem(new ItemBuilder("GOLDEN_APPLE"));
        } else {
            player.sendMessage(color("&cYou don't have enough Emeralds!"));
        }
    }
});

command.create("shop", "test", sender => {
    GUIManager.displayGlobalMenu(cast.asPlayer(sender), "shop");
});
```

When the script is loaded, our shop GUI is created, and all the command has to do is display it to players.

## GUI Options

ItemUtils GUIs can have additional options declared after declaring the GUI actions. These are:

**globalAction**: A function that will be executed regardless of what GUI slot is clicked.

**extraAction**: A function that will be executed after the clicked GUI slot's defined action is executed. Will only be called if that slot has an action declared.

**fallbackAction**: A function that will be executed if the clicked GUI slot does not have an action defined.

Syntax example:

```js
command.create("test", "test", sender => {
    const player = cast.asPlayer(sender);
    GUIManager.displayTemporaryMenu(player, new InventoryBuilder(1, "Test", {
        4: new ItemBuilder("GOLD_INGOT", color("&6Yes"))
    }, new ItemBuilder("IRON_INGOT", color("&fNo"))), {
        4: () => {
            player.sendMessage("Yes.");
        }
    }, {
        globalAction: () => {
            player.sendMessage("What will it be?");
        },
        extraAction: () => {
            player.sendMessage("Yes again!");
        },
        fallbackAction: () => {
            player.sendMessage("No.");
        }
    });
});
```

## GUI Templates

GUIManager can create inventory views from predefined templates. Templates are stored in the `plugins/Drupi/ItemUtils.yml` file. Let's create an example template that will alternate between iron and gold blocks across 3 inventory rows:

```yml
templates:
    ores:
        - ABABABABA
        - BABABABAB
        - ABABABABA
```

Right now, the server does not know what items to actually place in slots A and B, so it will use air by default. The amout of inventory rows is automatically determined by how many rows you add to the list. Now, let's make slot `A` bound to `IRON_INGOT` and slot `B` bound to `GOLD_INGOT`.

```js
const inventory = GUIManager.createViewFromTemplate("ores", "Test Inventory", {
    A: new ItemBuilder("IRON_INGOT"),
    B: new ItemBuilder("GOLD_INGOT")
});
```

We have now created an inventory that alternates between iron and gold ingots with barely any code at all.
