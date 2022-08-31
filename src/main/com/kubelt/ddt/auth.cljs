(ns com.kubelt.ddt.auth
  "Utilities relating to authentication."
  {:copyright "©2022 Proof Zero Inc." :license "Apache 2.0"}
  (:require
   [clojure.string :as cstr])
  (:require
   [com.kubelt.ddt.options :as ddt.options]
   [com.kubelt.lib.promise :as lib.promise]
   [com.kubelt.lib.storage :as lib.storage]
   [com.kubelt.lib.wallet :as lib.wallet]
   [com.kubelt.sdk.v1 :as sdk]
   [com.kubelt.sdk.v1.oort :as sdk.oort]))

;; args->init-options
;; -----------------------------------------------------------------------------

(defn args->init-options
  "Transform command line arguments into an SDK options map."
  [args-map wallet]
  (-> args-map
      ddt.options/init-options
      (assoc :crypto/wallet wallet)))

;; authenticate
;; -----------------------------------------------------------------------------

(defn authenticate
  "Performs an authentication call against a remote core for the user
  identified by a wallet. The args-map argument must be a map of parsed
  command line arguments that includes the name of the wallet to
  use. The supplied password is used to decrypt the wallet, and if
  authentication succeeds the on-authenticate callback is invoked. The
  callback must be a function of a single argument, and it will be
  passed an updated SDK instance that includes a security credential
  representing the successful authentication. "
  [args-map password on-authenticate]
  (let [app-name (get args-map :app-name)
        wallet-name (get args-map :wallet)
        blockchain (get args-map :blockchain)
        chain (get args-map :chain)
        chain-id (get args-map :chain-id)
        permission (get args-map :permission [])
        permission (reduce (fn [m s]
                             (let [[category perm] (cstr/split s #"[:/]")]
                               (update m category conj perm))) {} permission)]
    (-> (lib.wallet/load& app-name wallet-name password)
        (lib.promise/then
         (fn [wallet]
           (let [options (args->init-options args-map wallet)
                 address (:wallet/address wallet)]
             (-> (sdk/init options)
                 (lib.promise/catch
                     (fn [e]
                       (prn (:error e))))
                 (lib.promise/then
                  (fn [kbt]
                    (let [network {:network/blockchain blockchain
                                   :network/chain chain
                                   :network/chain-id chain-id}]
                      (-> (sdk.oort/authenticate& kbt permission network)
                          (lib.promise/then on-authenticate)
                          (lib.promise/catch
                              (fn [e]
                                (println (ex-message e))
                                (prn (ex-data e))))
                          (lib.promise/finally
                            (fn []
                              (sdk/halt! kbt)))))))))))
        ;; An error was thrown during (lib.wallet/load&).
        (lib.promise/catch
            (fn [e]
              (println (ex-message e))
              (prn (ex-data e)))))))
