(ns com.kubelt.lib.wallet.node
  "The Node.js implementation of a crypto wallet wrapper."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:refer-clojure :exclude [import])
  (:require
   ["fs" :refer [promises] :rename {promises fs-promises} :as fs]
   ["path" :as path])
  (:require
   ["@ethersproject/wallet" :refer [Wallet]])
  (:require
   [taoensso.timbre :as log])
  (:require
   [com.kubelt.lib.error :as lib.error]
   [com.kubelt.lib.io.node :as lib.io]
   [com.kubelt.lib.path :as lib.path]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.wallet.shared :as lib.wallet]))

(defn- name->path
  "Return the path to a wallet given the owning application name and
  wallet name."
  [app-name wallet-name]
  (let [wallet-path (lib.io/kubelt-dir app-name "wallets")
        wallet-path (.join path wallet-path wallet-name)]
    wallet-path))

;; Unused predicate
(defn- valid-perms?
  "Return true if the named wallet has the correct permissions, false
  otherwise."
  [app-name wallet-name]
  (let [read-ok (.. fs -constants -R_OK)
        write-ok (.. fs -constants -W_OK)
        perms (bit-or read-ok write-ok)
        wallet-path (name->path app-name wallet-name)]
    (try
      (.accessSync fs wallet-path read-ok)
      (catch js/Error e
        false))))

(defn ensure-wallet&
  "Return true if the named wallet already exists.
  Throws exception if wallet doesn't exist with this name"
  [app-name wallet-name]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (lib.io/ensure-kubelt-dir& app-name "wallets")
         (lib.promise/then
          (fn [_]
            (-> (lib.io/fs-exists?& (name->path app-name wallet-name))
                (lib.promise/then
                 (fn [x]
                   (if x
                     (resolve x)
                     (reject (lib.error/error (str "no wallet with this name: " wallet-name)))))))))
         (lib.promise/catch reject)))))

;; Public
;; -----------------------------------------------------------------------------
;; TODO allow wallet re-creation from mnemonic
;; TODO allow wallet listing
;; TODO allow wallet deletion

(defn has-wallet?&
  "Return wallet file path if the named wallet already exists. Returns nil if no wallet exists"
  [app-name wallet-name]
  (lib.io/fs-exists?& (name->path app-name wallet-name)))

(defn can-decrypt?&
  "Return true if the wallet can be successfully decrypted with the
  supplied password, and false otherwise.
  Throws exception if password is incorrect"
  [app-name wallet-name password]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (ensure-wallet& app-name wallet-name)
         (lib.promise/then
          (fn [wallet-path]
            (->
             (.readFile fs-promises wallet-path)
             (lib.promise/then #(.fromEncryptedJson Wallet % password))
             (lib.promise/then (fn [_] (resolve true)))
             (lib.promise/catch (fn [_] (reject (lib.error/error (str "password for '" wallet-name "' is incorrect"))))))))
         (lib.promise/catch reject)))))

(defn init&
  "Create and store an encrypted wallet. The encrypted wallet file is
  stored in an XDG compliant location based on the application name. It
  is also named using the supplied wallet name and encrypted with the
  supplied password. A map describing the created wallet is returned if
  successful. An error map is returned otherwise. Throws exception on
  wallet-encryption or fs-write problems."
  [app-name wallet-name password]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (lib.io/ensure-kubelt-dir& app-name "wallets")
         (lib.promise/then
          (fn [wallet-dirp]
            (log/debug {:log/msg "found wallet directory" :wallet/dir wallet-dirp})
            (-> (has-wallet?& app-name wallet-name)
                (lib.promise/then
                 (fn [file]
                   (when file
                     (reject (lib.error/error (str "wallet " wallet-name " already exists"))))
                   (let [wallet-path (.join path wallet-dirp wallet-name)
                         eth-wallet (.createRandom Wallet)
                         address (.-address eth-wallet)
                         mnemonic (.-mnemonic eth-wallet)]
                     (-> (.encrypt eth-wallet password)
                         (lib.promise/then #(.writeFile fs-promises wallet-path %))
                         (lib.promise/then
                          (fn []
                            (resolve
                             (let [{:keys [phrase path locale]} (js->clj mnemonic :keywordize-keys true)]
                               {:wallet/path wallet-path
                                :wallet/name wallet-name
                                :wallet/address address
                                :wallet.mnemonic/phrase phrase
                                :wallet.mnemonic/path path
                                :wallet.mnemonic/locale locale}))))
                         (lib.promise/catch
                             (fn [e]
                               (reject (lib.error/error e)))))))))))
         (lib.promise/catch reject)))))

(defn load&
  "Return a promise that resolves to a wallet map, or that rejects with an
  error map if a problem occurs."
  [app-name wallet-name password]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (ensure-wallet& app-name wallet-name)
         (lib.promise/then
          (fn [wallet-path]
            (-> (.readFile fs-promises wallet-path "utf8")
                (lib.promise/then
                 (fn [wallet-str]
                   (let [eth-wallet (.fromEncryptedJsonSync Wallet wallet-str password)
                         address (.-address eth-wallet)
                         sign-fn (lib.wallet/make-sign-fn eth-wallet)]
                     (resolve
                      {:com.kubelt/type :kubelt.type/wallet
                       :wallet/address address
                       :wallet/sign-fn sign-fn}))))
                (lib.promise/catch
                 (fn [error]
                   (reject (lib.error/error error)))))))
         (lib.promise/catch reject)))))

(defn ls&
  "Return a list of wallet names."
  [app-name]
  (lib.promise/promise
   (fn [resolve reject]
     (-> (lib.io/ensure-kubelt-dir& app-name "wallets")
         (lib.promise/then #(resolve (js->clj (.readdir fs-promises %))))
         (lib.promise/catch reject)))))

(defn delete!&
  "Delete a wallet."
  [app-name wallet-name]
  (let [wallet-path (name->path app-name wallet-name)]
    (.unlink fs-promises wallet-path)))

(defn create
  ""
  []
  :fixme
  ;; (<! (lib.wallet/random-wallet))
  #_(let [sign-fn (lib.wallet/make-sign-fn eth-wallet)]
      {:wallet/address :fixme
       :wallet/sign-fn sign-fn}))

(defn import&
  "Import a wallet and store it encrypted. Returns a promise that resolves
  to the path to the imported wallet, or if an error occurs rejects with
  a standard error map.
  Throws encrypt or fs-wallet exceptions"
  [app-name wallet-name mnemonic password]
  (lib.promise/promise
   (fn [resolve reject]
     ;; The wallet with the given name doesn't yet exist, we can import
     ;; from the mnemonic and create a wallet with that name.
     (letfn [;; Returns a promise that resolves to the wallet
             ;; JSON. Throws if the mnemonic is invalid.
             (from-mnemonic [mnemonic]
               (try
                 (let [w (.fromMnemonic Wallet mnemonic)]
                   ;; Returns a promise.
                   (.encrypt w password))
                 (catch js/Error e
                   (let [error (lib.error/from-obj e)]
                     (reject error)))))
             ;; Returns the path of the wallet file to write.
             (wallet-path []
               (-> (lib.io/ensure-kubelt-dir& app-name "wallets")
                   (lib.promise/then #(.join path % wallet-name))))]
       (let [path& (wallet-path)
             wallet& (from-mnemonic mnemonic)]
         (-> (has-wallet?& app-name wallet-name)
             (lib.promise/then
              (fn [wallet]
                (when wallet (reject (lib.error/error (str "wallet " wallet-name " already exists"))))
                (-> (lib.promise/all [path& wallet&])
                    (lib.promise/then
                     (fn [[wallet-dirp wallet-js]]
                       (-> (.writeFile fs-promises wallet-dirp wallet-js)
                           (lib.promise/then (fn [_] (resolve {:wallet/name wallet-name})))
                           (lib.promise/catch (fn [e] (reject (lib.error/from-obj e)))))))
                    (lib.promise/catch (fn [e] (reject (lib.error/from-obj e)))))))))))))
