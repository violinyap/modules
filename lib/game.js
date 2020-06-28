(function () {
  const image_type = "image";
  const text_type = "text";
  const container_type = "container";
  const obj_types = [image_type, text_type, container_type];

  ///////////////////////////
  //        HELPER         //
  ///////////////////////////

  function is_type(obj, type) {
    return obj[0] === type;
  }

  function is_any_type(obj, types) {
    for (let i = 0; i < types.length; i++) {
      if (is_type(obj, types[i])) return true;
    }
    return false;
  }

  ///////////////////////////
  //        PRELOAD        //
  ///////////////////////////

  function load_image(key, url) {
    return function (scene) {
      scene.load.image(key, url);
    };
  }

  ///////////////////////////
  //         CREATE        //
  ///////////////////////////

  function add_to_scene(obj) {
    return function (scene) {
      if (is_any_type(obj, obj_types)) {
        scene.add(obj);
      } else {
        // TODO: Handle error
      }
    };
  }

  ///////////////////////////
  //         IMAGE         //
  ///////////////////////////

  function create_image(x, y, asset_key) {
    return function (scene) {
      return [
        image_type,
        new Phaser.GameObjects.Sprite(scene, x, y, asset_key),
      ];
    };
  }

  ///////////////////////////
  //         TEXT          //
  ///////////////////////////

  function create_text(x, y, text, text_style) {
    return function (scene) {
      return [
        text_type,
        new Phaser.GameObjects.Text(scene, x, y, text, text_style),
      ];
    };
  }

  ///////////////////////////
  //       CONTAINER       //
  ///////////////////////////

  function create_container(x, y) {
    return function (scene) {
      return [container_type, new Phaser.GameObjects.Container(scene, x, y)];
    };
  }

  function add_to_container(container, obj) {
    return function (scene) {
      const actual_cont = container(scene);
      const actual_obj = obj(scene);
      if (
        is_type(actual_cont, container_type) &&
        is_any_types(actual_obj, obj_types)
      ) {
        return container.add(obj);
      } else {
        // TODO: Handle error
      }
    };
  }
  
  ///////////////////////////
  //         OBJECT        //
  ///////////////////////////

  function set_display_size(obj, x, y) {
    return function (scene) {
      const actual_obj = obj(scene);
      if (is_any_type(actual_obj, obj_types)) {
        return actual_obj.setDisplaySize(x, y);
      } else {
        // TODO: Handle error
      }
    };
  }

  function set_alpha(obj, alpha) {
    return function (scene) {
      const actual_obj = obj(scene);
      if (is_any_type(actual_obj, obj_types)) {
        return actual_obj.setAlpha(alpha);
      } else {
        // TODO: Handle error
      }
    };
  }

  function set_interactive(obj, shape) {
    return function (scene) {
      const actual_obj = obj(scene);
      if (is_any_type(actual_obj, obj_types)) {
        return actual_obj.setInteractive(shape);
      } else {
        // TODO: Handle error
      }
    };
  }

  return {
    load_image: load_image,
    add: add_to_scene,
    create_image: create_image,
    create_text: create_text,
    create_container: create_container,
    add_to_container: add_to_container,
    set_display_size: set_display_size,
    set_alpha: set_alpha,
    set_interactive: set_interactive,
  };
})();