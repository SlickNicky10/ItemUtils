# ItemUtils
ItemUtils module for use with Drupi. Download Drupi at https://stacket.net/drupi

The current latest version of ItemUtils is **1.0**, and this documentation will always be in reference to the latest version of ItemUtils.

# What's ItemUtils?
ItemUtils is a Drupi module that makes creating items and interactive GUIs fast and easy. ItemUtils can be used for simple things, like making it easier to give a player an item, or to create a deep system of interactive inventories. The possibilities are limitless!

# Install Guide
Firstly, make sure that `Drupi` is installed on your server. If it isn't, you can download it from https://stacket.net/drupi. Once Drupi is installed, restart your server and execute the command `/drupi install ItemUtils`. You can now use TaskUtils in your Drupi scripts!

# How to use ItemBuilder

There are 4 parameters that can be passed to the ItemBuilder constructor. These are:

`material` *(string)* - the Material you want to use. Example: "DIAMOND"

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
