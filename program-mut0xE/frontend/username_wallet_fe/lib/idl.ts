/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/username_wallet.json`.
 */

export const IDL = {
  address: "BWEK6JuhkArseF8WhofrDSxK7wr9oDmRDvmbvALxsGML",
  metadata: {
    name: "username_wallet",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "register_username",
      discriminator: [134, 54, 123, 181, 28, 151, 36, 0],
      accounts: [
        {
          name: "user",
          writable: true,
          signer: true,
        },
        {
          name: "username_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  117, 115, 101, 114, 110, 97, 109, 101, 95, 119, 97, 108, 108,
                  101, 116,
                ],
              },
              {
                kind: "arg",
                path: "username",
              },
            ],
          },
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "username",
          type: "string",
        },
      ],
    },
    {
      name: "send_sol",
      discriminator: [214, 24, 219, 18, 3, 205, 201, 179],
      accounts: [
        {
          name: "sender",
          writable: true,
          signer: true,
        },
        {
          name: "user_wallet",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  117, 115, 101, 114, 110, 97, 109, 101, 95, 119, 97, 108, 108,
                  101, 116,
                ],
              },
              {
                kind: "arg",
                path: "username",
              },
            ],
          },
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "username",
          type: "string",
        },
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdraw_sol",
      discriminator: [145, 131, 74, 136, 65, 137, 42, 38],
      accounts: [
        {
          name: "signer",
          writable: true,
          signer: true,
        },
        {
          name: "user_wallet",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  117, 115, 101, 114, 110, 97, 109, 101, 95, 119, 97, 108, 108,
                  101, 116,
                ],
              },
              {
                kind: "arg",
                path: "username",
              },
            ],
          },
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "username",
          type: "string",
        },
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "UserNameWallet",
      discriminator: [147, 122, 188, 51, 141, 93, 96, 162],
    },
  ],
  events: [
    {
      name: "SolSent",
      discriminator: [217, 217, 185, 254, 120, 26, 82, 33],
    },
    {
      name: "SolWithdrawn",
      discriminator: [145, 249, 69, 48, 206, 86, 91, 66],
    },
    {
      name: "UsernameRegistered",
      discriminator: [241, 79, 103, 207, 185, 19, 151, 5],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "UsernameTooShort",
      msg: "Username too short (min 3 chars)",
    },
    {
      code: 6001,
      name: "UsernameTooLong",
      msg: "Username too long (max 50 chars)",
    },
    {
      code: 6002,
      name: "InvalidFormat",
      msg: "Invalid username format",
    },
    {
      code: 6003,
      name: "InsufficientBalance",
      msg: "Insufficient balance to withdraw",
    },
    {
      code: 6004,
      name: "Unauthorized",
      msg: "Unauthorized",
    },
    {
      code: 6005,
      name: "InvalidAmount",
      msg: "Invalid amount",
    },
    {
      code: 6006,
      name: "BalanceOverflow",
      msg: "OverFlow",
    },
    {
      code: 6007,
      name: "BalanceUnderflow",
      msg: "UnderFlow",
    },
  ],
  types: [
    {
      name: "SolSent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "username",
            type: "string",
          },
          {
            name: "sender",
            type: "pubkey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "timestamp",
            type: "i64",
          },
        ],
      },
    },
    {
      name: "SolWithdrawn",
      type: {
        kind: "struct",
        fields: [
          {
            name: "username",
            type: "string",
          },
          {
            name: "owner",
            type: "pubkey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "timestamp",
            type: "i64",
          },
        ],
      },
    },
    {
      name: "UserNameWallet",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "pubkey",
          },
          {
            name: "username",
            type: "string",
          },
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "created_at",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "UsernameRegistered",
      type: {
        kind: "struct",
        fields: [
          {
            name: "username",
            type: "string",
          },
          {
            name: "owner",
            type: "pubkey",
          },
          {
            name: "timestamp",
            type: "i64",
          },
        ],
      },
    },
  ],
};
