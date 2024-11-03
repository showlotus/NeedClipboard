{
  "targets": [
    {
      "target_name": "native-clipboard",
      "sources": ["lib/main.cpp"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except",
      ],
      # 'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
    }
  ]
}
